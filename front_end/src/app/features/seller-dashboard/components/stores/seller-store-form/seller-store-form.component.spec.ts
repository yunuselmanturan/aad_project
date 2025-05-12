import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';

import { SellerStoreFormComponent } from './seller-store-form.component';
import { SellerStoreService } from '../../../services/seller-store.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { SharedModule } from '../../../../../shared/shared.module';

describe('SellerStoreFormComponent', () => {
  let component: SellerStoreFormComponent;
  let fixture: ComponentFixture<SellerStoreFormComponent>;
  let storeServiceSpy: jasmine.SpyObj<SellerStoreService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    const storeSpy = jasmine.createSpyObj('SellerStoreService', [
      'getStore', 'createStore', 'updateStore'
    ]);
    const notifySpy = jasmine.createSpyObj('NotificationService', ['showSuccess', 'showError']);

    await TestBed.configureTestingModule({
      declarations: [ SellerStoreFormComponent ],
      imports: [
        ReactiveFormsModule,
        HttpClientTestingModule,
        RouterTestingModule,
        SharedModule
      ],
      providers: [
        { provide: SellerStoreService, useValue: storeSpy },
        { provide: NotificationService, useValue: notifySpy },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({}))
          }
        }
      ]
    })
    .compileComponents();

    storeServiceSpy = TestBed.inject(SellerStoreService) as jasmine.SpyObj<SellerStoreService>;
    notificationServiceSpy = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SellerStoreFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form', () => {
    expect(component.storeForm).toBeDefined();
    expect(component.storeForm.get('storeName')).toBeDefined();
    expect(component.storeForm.get('description')).toBeDefined();
  });

  it('should validate required fields', () => {
    const storeNameControl = component.storeForm.get('storeName');
    storeNameControl?.setValue('');
    expect(storeNameControl?.valid).toBeFalsy();
    expect(storeNameControl?.hasError('required')).toBeTruthy();

    storeNameControl?.setValue('Test Store');
    expect(storeNameControl?.valid).toBeTruthy();
  });

  it('should validate minimum length', () => {
    const storeNameControl = component.storeForm.get('storeName');
    storeNameControl?.setValue('Ab');
    expect(storeNameControl?.valid).toBeFalsy();
    expect(storeNameControl?.hasError('minlength')).toBeTruthy();

    storeNameControl?.setValue('Abc');
    expect(storeNameControl?.valid).toBeTruthy();
  });
});
