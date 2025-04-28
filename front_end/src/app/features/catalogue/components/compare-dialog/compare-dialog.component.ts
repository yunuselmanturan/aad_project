// features/catalogue/components/compare-dialog/compare-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Product } from '../../services/product.service';

@Component({
  selector: 'app-compare-dialog',
  standalone: false,
  templateUrl: './compare-dialog.component.html',
  styleUrls: ['./compare-dialog.component.css']
})
export class CompareDialogComponent {
  productA: Product;
  productB: Product;
  constructor(@Inject(MAT_DIALOG_DATA) public data: { productA: Product, productB: Product }) {
    this.productA = data.productA;
    this.productB = data.productB;
  }
}
