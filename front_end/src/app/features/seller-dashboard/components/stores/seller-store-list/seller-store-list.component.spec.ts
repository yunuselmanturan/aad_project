import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { SellerStoreListComponent } from './seller-store-list.component';
import { SellerStoreService } from '../../../services/seller-store.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { SharedModule } from '../../../../../shared/shared.module';

describe('SellerStoreListComponent', () => {
  let component: SellerStoreListComponent;
  let fixture: ComponentFixture<SellerStoreListComponent>;
  let storeServiceSpy: jasmine.SpyObj<SellerStoreService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;
  let router: Router;

  beforeEach(async () => {
    const storeSpy = jasmine.createSpyObj('SellerStoreService', ['getStores', 'deleteStore']);
    const notifySpy = jasmine.createSpyObj('NotificationService', ['showSuccess', 'showError']);

    await TestBed.configureTestingModule({
      declarations: [ SellerStoreListComponent ],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        SharedModule
      ],
      providers: [
        { provide: SellerStoreService, useValue: storeSpy },
        { provide: NotificationService, useValue: notifySpy }
      ]
    })
    .compileComponents();

    storeServiceSpy = TestBed.inject(SellerStoreService) as jasmine.SpyObj<SellerStoreService>;
    notificationServiceSpy = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
    router = TestBed.inject(Router);
  });

  beforeEach(() => {
    storeServiceSpy.getStores.and.returnValue(of([]));
    fixture = TestBed.createComponent(SellerStoreListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load stores on init', () => {
    expect(storeServiceSpy.getStores).toHaveBeenCalled();
  });

  it('should navigate to add store page when addStore is called', () => {
    spyOn(router, 'navigate');
    component.addStore();
    expect(router.navigate).toHaveBeenCalledWith(['/seller/stores/new']);
  });

  it('should delete a store when confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    storeServiceSpy.deleteStore.and.returnValue(of(void 0));
    spyOn(component, 'loadStores');

    component.deleteStore(1);

    expect(storeServiceSpy.deleteStore).toHaveBeenCalledWith(1);
    expect(notificationServiceSpy.showSuccess).toHaveBeenCalled();
    expect(component.loadStores).toHaveBeenCalled();
  });
});
