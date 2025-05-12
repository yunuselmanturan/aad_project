import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

import { CategoryManagementComponent } from './category-management.component';
import { CategoryService } from '../../../services/category.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { SharedModule } from '../../../../../shared/shared.module';

describe('CategoryManagementComponent', () => {
  let component: CategoryManagementComponent;
  let fixture: ComponentFixture<CategoryManagementComponent>;
  let categoryServiceSpy: jasmine.SpyObj<CategoryService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    const categorySpy = jasmine.createSpyObj('CategoryService', ['getAllCategories', 'deleteCategory']);
    const notifySpy = jasmine.createSpyObj('NotificationService', ['showSuccess', 'showError']);

    await TestBed.configureTestingModule({
      declarations: [ CategoryManagementComponent ],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        SharedModule
      ],
      providers: [
        { provide: CategoryService, useValue: categorySpy },
        { provide: NotificationService, useValue: notifySpy }
      ]
    })
    .compileComponents();

    categoryServiceSpy = TestBed.inject(CategoryService) as jasmine.SpyObj<CategoryService>;
    notificationServiceSpy = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
  });

  beforeEach(() => {
    categoryServiceSpy.getAllCategories.and.returnValue(of([]));
    fixture = TestBed.createComponent(CategoryManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load categories on init', () => {
    expect(categoryServiceSpy.getAllCategories).toHaveBeenCalled();
  });

  it('should get parent category name correctly', () => {
    // Setup mock data
    component.categories = [
      { id: 1, name: 'Category 1' },
      { id: 2, name: 'Category 2', parentCategoryId: 1 }
    ];

    // Test getting name for a category with a parent
    expect(component.getParentCategoryName(1)).toEqual('Category 1');

    // Test getting name for a root category
    expect(component.getParentCategoryName(undefined)).toEqual('None (Root Category)');

    // Test getting name for a non-existent parent
    expect(component.getParentCategoryName(999)).toEqual('Unknown');
  });
});
