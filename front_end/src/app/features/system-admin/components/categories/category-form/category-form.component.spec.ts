import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';

import { CategoryFormComponent } from './category-form.component';
import { CategoryService } from '../../../services/category.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { SharedModule } from '../../../../../shared/shared.module';

describe('CategoryFormComponent', () => {
  let component: CategoryFormComponent;
  let fixture: ComponentFixture<CategoryFormComponent>;
  let categoryServiceSpy: jasmine.SpyObj<CategoryService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    const categorySpy = jasmine.createSpyObj('CategoryService', [
      'getAllCategories', 'getCategory', 'createCategory', 'updateCategory'
    ]);
    const notifySpy = jasmine.createSpyObj('NotificationService', ['showSuccess', 'showError']);

    await TestBed.configureTestingModule({
      declarations: [ CategoryFormComponent ],
      imports: [
        ReactiveFormsModule,
        HttpClientTestingModule,
        RouterTestingModule,
        SharedModule
      ],
      providers: [
        { provide: CategoryService, useValue: categorySpy },
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

    categoryServiceSpy = TestBed.inject(CategoryService) as jasmine.SpyObj<CategoryService>;
    notificationServiceSpy = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
  });

  beforeEach(() => {
    categoryServiceSpy.getAllCategories.and.returnValue(of([]));
    fixture = TestBed.createComponent(CategoryFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form', () => {
    expect(component.categoryForm).toBeDefined();
    expect(component.categoryForm.get('name')).toBeDefined();
    expect(component.categoryForm.get('parentCategoryId')).toBeDefined();
  });

  it('should validate required fields', () => {
    const nameControl = component.categoryForm.get('name');
    nameControl?.setValue('');
    expect(nameControl?.valid).toBeFalsy();
    expect(nameControl?.hasError('required')).toBeTruthy();

    nameControl?.setValue('Test Category');
    expect(nameControl?.valid).toBeTruthy();
  });

  it('should validate minimum length', () => {
    const nameControl = component.categoryForm.get('name');
    nameControl?.setValue('A');
    expect(nameControl?.valid).toBeFalsy();
    expect(nameControl?.hasError('minlength')).toBeTruthy();

    nameControl?.setValue('AB');
    expect(nameControl?.valid).toBeTruthy();
  });

  it('should load all categories on init', () => {
    expect(categoryServiceSpy.getAllCategories).toHaveBeenCalled();
  });
});
