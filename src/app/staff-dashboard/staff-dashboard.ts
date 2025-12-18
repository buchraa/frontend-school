import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  StaffService,
  BillingStatus,
  Payment,
  ImportBankLine,
  ImportBankResult,
} from '../staff/staff.service';

@Component({
  selector: 'app-staff-dashboard',
  imports: [FormsModule, CommonModule],
  templateUrl: './staff-dashboard.html',
  styleUrl: './staff-dashboard.css',
})
export class StaffDashboard implements OnInit {
  year = new Date().getFullYear();
  month = new Date().getMonth() + 1;

  loadingStatus = false;
  loadingOverdue = false;
  loadingPayments = false;
  importing = false;
   isDragging = false;

  billingStatus: BillingStatus[] = [];
  overdue: BillingStatus[] = [];
  payments: Payment[] = [];

  // Pour l'import bancaire simple
  newLine: ImportBankLine = {
    reference: '',
    amount: 0,
    date: new Date().toISOString().substring(0, 10), // yyyy-mm-dd
  };
  importLines: ImportBankLine[] = [];
  importResults: ImportBankResult[] = [];
  importError: string | null = null;

  constructor(private staffService: StaffService) {}

  ngOnInit(): void {
    this.loadStatus();
    this.loadOverdue();
    this.loadPayments();
  }

  loadStatus(): void {
    this.loadingStatus = true;
    this.staffService.getBillingStatus(this.year, this.month).subscribe({
      next: (data) => {
        this.billingStatus = data;
        this.loadingStatus = false;
      },
      error: (err) => {
        console.error(err);
        this.loadingStatus = false;
      },
    });
  }

  loadOverdue(): void {
    this.loadingOverdue = true;
    this.staffService.getOverdue(this.year, this.month).subscribe({
      next: (data) => {
        this.overdue = data;
        this.loadingOverdue = false;
      },
      error: (err) => {
        console.error(err);
        this.loadingOverdue = false;
      },
    });
  }

  loadPayments(): void {
    this.loadingPayments = true;
    this.staffService.getAllPayments().subscribe({
      next: (data) => {
        this.payments = data;
        this.loadingPayments = false;
      },
      error: (err) => {
        console.error(err);
        this.loadingPayments = false;
      },
    });
  }

  refreshAll(): void {
    this.loadStatus();
    this.loadOverdue();
    this.loadPayments();
  }

  addImportLine(): void {
    if (!this.newLine.reference || !this.newLine.amount || !this.newLine.date) {
      return;
    }
    this.importLines.push({ ...this.newLine });
    this.newLine.reference = '';
    this.newLine.amount = 0;
    this.newLine.date = new Date().toISOString().substring(0, 10);
  }

  clearImportLines(): void {
    this.importLines = [];
    this.importResults = [];
    this.importError = null;
  }

  submitImport(): void {
    if (this.importLines.length === 0) {
      this.importError = 'Aucune ligne à importer.';
      return;
    }
    this.importError = null;
    this.importing = true;

    this.staffService.importBank(this.importLines).subscribe({
      next: (results) => {
        this.importResults = results;
        this.importing = false;
        // recharger le status et les paiements
        this.refreshAll();
      },
      error: (err) => {
        console.error(err);
        this.importError = 'Erreur lors de l’import.';
        this.importing = false;
      },
    });
  }
  getStatusClass(status: BillingStatus['status']): string {
  switch (status) {
    case 'PAID':
      return 'badge badge-paid';
    case 'PARTIAL':
      return 'badge badge-partial';
    case 'OVERDUE':
      return 'badge badge-overdue';
    case 'PENDING':
    default:
      return 'badge badge-pending';
  }
}

familyFilter = '';
statusFilter: BillingStatus['status'] | 'ALL' = 'ALL';

get filteredBillingStatus(): BillingStatus[] {
  return this.billingStatus.filter((b) => {
    const matchFamily =
      !this.familyFilter ||
      b.parent.familyCode
        .toLowerCase()
        .includes(this.familyFilter.toLowerCase()) ||
      b.parent.fullName
        .toLowerCase()
        .includes(this.familyFilter.toLowerCase());

    const matchStatus =
      this.statusFilter === 'ALL' || b.status === this.statusFilter;

    return matchFamily && matchStatus;
  });
}

get filteredOverdue(): BillingStatus[] {
  return this.overdue.filter((b) => {
    const matchFamily =
      !this.familyFilter ||
      b.parent.familyCode
        .toLowerCase()
        .includes(this.familyFilter.toLowerCase()) ||
      b.parent.fullName
        .toLowerCase()
        .includes(this.familyFilter.toLowerCase());

    // pour overdue, status sera normalement OVERDUE, mais on garde la même logique
    const matchStatus =
      this.statusFilter === 'ALL' || b.status === this.statusFilter;

    return matchFamily && matchStatus;
  });
}



  getStatusLabel(status: BillingStatus['status']): string {
    switch (status) {
      case 'PAID':
        return 'Payé';
      case 'PARTIAL':
        return 'Partiel';
      case 'OVERDUE':
        return 'En retard';
      case 'PENDING':
      default:
        return 'En attente';
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.processFile(file);

    // reset de l'input pour pouvoir réuploader le même fichier
    input.value = '';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;

    if (!event.dataTransfer || !event.dataTransfer.files.length) return;

    const file = event.dataTransfer.files[0];
    this.processFile(file);
  }

  private processFile(file: File): void {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      this.importError = 'Merci de sélectionner un fichier CSV (.csv)';
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const text = reader.result as string;
      try {
        const lines = this.parseCsvToImportLines(text);
        this.importLines = lines;
        this.importResults = [];
        this.importError = null;
      } catch (e) {
        console.error(e);
        this.importError = 'Erreur lors du parsing du fichier CSV.';
      }
    };

    reader.onerror = () => {
      this.importError = 'Impossible de lire le fichier.';
    };

    reader.readAsText(file, 'utf-8');
  }

  private parseCsvToImportLines(text: string): ImportBankLine[] {
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l);

    if (lines.length === 0) {
      return [];
    }

    const result: ImportBankLine[] = [];

    // Détecter ; ou ,
    const separator = lines[0].includes(';') ? ';' : ',';

    // On suppose que la 1ère ligne est un header si elle contient 'reference'
    const startIndex = lines[0].toLowerCase().includes('reference') ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const row = lines[i].split(separator);

      if (row.length < 3) continue;

      const reference = row[0].trim();
      const amount = Number(row[1].replace(',', '.').trim());
      const date = row[2].trim();

      if (!reference || isNaN(amount) || !date) continue;

      result.push({ reference, amount, date });
    }

    return result;
  }


}
