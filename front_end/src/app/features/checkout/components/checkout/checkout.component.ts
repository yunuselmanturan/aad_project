import { CartService, CartItem } from './../../../cart/services/cart.service';
// features/checkout/components/checkout/checkout.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrderService } from '../../services/order.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { Address } from '../../../auth/components/user-profile/user-profile.component';
import { AddressService } from '../../../../core/services/address.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-checkout',
  standalone: false,
  templateUrl: './checkout.component.html'
})
export class CheckoutComponent implements OnInit {
  savedAddresses: Address[] = [];
  checkoutForm!: FormGroup;
  addressForm!: FormGroup;
  cartItems: CartItem[] = [];
  submitted: boolean = false;
  error: string | null = null;

  useExistingAddress: boolean = true;
  showAddressForm: boolean = false;

  get isLoggedIn(): boolean {
    return !!this.authService.currentUserSubject.value;
  }

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private orderService: OrderService,
    private addressService: AddressService,
    private router: Router,
    private authService: AuthService,
    private notify: NotificationService
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
    if (this.isLoggedIn) {
      this.addressService.getAddresses().subscribe({
        next: (response) => {
          this.savedAddresses = response.data.map(addr => ({
            ...addr,
            isDefault: addr.primary || false
          }));
          if (this.savedAddresses.length > 0) {
            const defaultAddress = this.savedAddresses.find(addr => addr);
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
            this.useExistingAddress = false;
            this.showAddressForm = true;
          }
        },
        error: (error) => {
          console.error('Failed to load addresses:', error);
          this.error = 'Failed to load saved addresses';
          this.useExistingAddress = false;
          this.showAddressForm = true;
        }
      });
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
    this.error = null;

    if (this.useExistingAddress) {
      if (this.checkoutForm.invalid) return;

      const selectedAddressId = this.checkoutForm.value.selectedAddressId;
      this.createOrder({ addressId: selectedAddressId });
    } else {
      if (this.addressForm.invalid) return;

      const addressData = this.addressForm.value;
      if (this.isLoggedIn && addressData.saveAddress) {
        // Save address first, then create order
        this.addressService.createAddress({
          street: addressData.street,
          city: addressData.city,
          state: addressData.state,
          zipCode: addressData.zipCode,
          country: addressData.country,
          primary: false
        }).subscribe({
          next: (response) => {
            this.createOrder({ addressId: response.data.id });
          },
          error: (error) => {
            console.error('Failed to save address:', error);
            this.error = 'Failed to save address';
          }
        });
      } else {
        // Guest checkout - pass address directly
        this.createOrder({
          address: addressData
        });
      }
    }
  }

  private createOrder(shippingInfo: any): void {
    this.orderService.createOrder(shippingInfo, this.cartItems).subscribe({
      next: (order) => {
        this.cartService.clearCart();
        this.router.navigate(['/checkout/success'], {
          queryParams: { orderId: order.id }
        });
      },
      error: (err) => {
        console.error('Order creation failed:', err);
        this.error = 'Failed to create order. Please try again.';
      }
    });
  }

  private saveNewAddress(addressData: any): void {
    const newAddress = {
      street: addressData.street,
      city: addressData.city,
      state: addressData.state,
      zipCode: addressData.zipCode,
      country: addressData.country,
      primary: false
    };

    this.addressService.createAddress(newAddress).subscribe({
      next: (response) => {
        const savedAddress = { ...response.data, isDefault: response.data.primary || false };
        this.savedAddresses.push(savedAddress);
        return savedAddress.id; // Return the ID for order creation
      },
      error: (error) => {
        console.error('Failed to save address:', error);
        throw new Error('Failed to save address');
      }
    });
  }

  calculateTotal(): number {
    return this.cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }
}
