import { TestBed } from '@angular/core/testing';

import { SellerOrderService } from './seller-order.service';

describe('SellerOrderService', () => {
  let service: SellerOrderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SellerOrderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
