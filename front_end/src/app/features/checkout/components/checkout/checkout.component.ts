import { CartService, CartItem } from './../../../cart/services/cart.service';
// features/checkout/components/checkout/checkout.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrderService } from '../../services/order.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { Address } from '../../../auth/components/user-profile/user-profile.component';

@Component({
  selector: 'app-checkout',
  standalone: false,
  templateUrl: './checkout.component.html'
})
export class CheckoutComponent implements OnInit {
  checkoutForm!: FormGroup;
  addressForm!: FormGroup;
  cartItems: CartItem[] = [];
  submitted: boolean = false;
  error: string | null = null;

  savedAddresses: Address[] = [];
  useExistingAddress: boolean = true;
  showAddressForm: boolean = false;

  get isLoggedIn(): boolean {
    return !!this.authService.currentUserSubject.value;
  }

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private orderService: OrderService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Get current cart items
    this.cartItems = this.cartService.getItems();
    if (!this.cartItems.length) {
      // If cart empty, redirect to cart page
      this.router.navigate(['/cart']);
      return;
    }

    // Initialize checkout form with address selector
    this.checkoutForm = this.fb.group({
      selectedAddressId: ['', Validators.required]
    });

    // Initialize new address form
    this.addressForm = this.fb.group({
      street: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: ['', Validators.required],
      country: ['', Validators.required],
      saveAddress: [true]
    });

    // Load user's saved addresses if logged in
    if (this.isLoggedIn) {
      this.loadUserAddresses();
    } else {
      // If not logged in, default to manual address entry
      this.useExistingAddress = false;
      this.showAddressForm = true;
    }
  }

  get f() { return this.checkoutForm.controls; }
  get a() { return this.addressForm.controls; }

  // Load user's saved addresses
  loadUserAddresses(): void {
    // In a real app, this would be an API call
    // For now, we'll mock the data (similar to the profile component)
    this.savedAddresses = [
      {
        id: 1,
        street: '123 Main St',
        city: 'Anytown',
        state: 'ST',
        zipCode: '12345',
        country: 'USA',
        isDefault: true
      }
    ];

    // If user has saved addresses, select the default one
    if (this.savedAddresses.length > 0) {
      const defaultAddress = this.savedAddresses.find(addr => addr.isDefault);
      if (defaultAddress) {
        this.checkoutForm.patchValue({
          selectedAddressId: defaultAddress.id
        });
      } else {
        this.checkoutForm.patchValue({
          selectedAddressId: this.savedAddresses[0].id
        });
      }
    } else {
      // If no saved addresses, show the address form
      this.useExistingAddress = false;
      this.showAddressForm = true;
    }
  }

  toggleAddressForm(): void {
    this.useExistingAddress = !this.useExistingAddress;
    this.showAddressForm = !this.useExistingAddress;

    if (this.useExistingAddress) {
      // Reset the address form when switching back to saved addresses
      this.addressForm.reset();
      this.addressForm.patchValue({ saveAddress: true });
    } else {
      // Reset address selection when switching to new address
      this.checkoutForm.get('selectedAddressId')?.reset();
    }
  }

  onSubmit(): void {
    this.submitted = true;

    let shippingInfo: any;

    if (this.useExistingAddress) {
      // Using a saved address
      if (this.checkoutForm.invalid) return;

      const selectedAddressId = this.checkoutForm.value.selectedAddressId;
      const selectedAddress = this.savedAddresses.find(addr => addr.id === selectedAddressId);

      if (!selectedAddress) {
        this.error = 'Please select a valid address.';
        return;
      }

      shippingInfo = {
        fullName: this.authService.currentUserSubject.value?.name,
        address: selectedAddress.street,
        city: selectedAddress.city,
        state: selectedAddress.state,
        postalCode: selectedAddress.zipCode,
        country: selectedAddress.country,
        addressId: selectedAddress.id
      };
    } else {
      // Using a new address
      if (this.addressForm.invalid) return;

      const addressData = this.addressForm.value;

      shippingInfo = {
        fullName: this.authService.currentUserSubject.value?.name || 'Guest',
        address: addressData.street,
        city: addressData.city,
        state: addressData.state,
        postalCode: addressData.zipCode,
        country: addressData.country
      };

      // If user is logged in and wants to save the address, do it
      if (this.isLoggedIn && addressData.saveAddress) {
        this.saveNewAddress(addressData);
      }
    }

    // Call OrderService to create order with the shipping info
    this.orderService.createOrder(shippingInfo, this.cartItems).subscribe({
      next: order => {
        // Store the order ID for the payment step
        sessionStorage.setItem('currentOrderId', String(order.id));
        this.router.navigate(['/checkout/payment']);
      },
      error: err => {
        console.error('Order creation failed', err);
        this.error = 'Failed to create order. Please try again.';
      }
    });
  }

  private saveNewAddress(addressData: any): void {
    // In a real app, this would be an API call to save the address
    console.log('Saving new address:', addressData);
    // Mock implementation - we'd normally send this to the backend
    const newAddress: Address = {
      id: Date.now(), // Temporary ID
      street: addressData.street,
      city: addressData.city,
      state: addressData.state,
      zipCode: addressData.zipCode,
      country: addressData.country,
      isDefault: false
    };

    // Update the local list
    this.savedAddresses.push(newAddress);
  }

  calculateTotal(): number {
    return this.cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }
}
