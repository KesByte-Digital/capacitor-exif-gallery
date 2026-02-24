import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { IonicModule, AlertController } from '@ionic/angular';
import { OnboardingPage } from './onboarding.page';
import { StorageService } from '../services/storage.service';

describe('OnboardingPage', () => {
  let component: OnboardingPage;
  let fixture: ComponentFixture<OnboardingPage>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockStorage: jasmine.SpyObj<StorageService>;
  let mockAlertController: jasmine.SpyObj<AlertController>;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockStorage = jasmine.createSpyObj('StorageService', ['set', 'get']);
    mockAlertController = jasmine.createSpyObj('AlertController', ['create']);

    await TestBed.configureTestingModule({
      declarations: [OnboardingPage],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: StorageService, useValue: mockStorage },
        { provide: AlertController, useValue: mockAlertController },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OnboardingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with first slide', () => {
    expect(component.currentSlideIndex).toBe(0);
    expect(component.isFirstSlide).toBe(true);
    expect(component.isLastSlide).toBe(false);
  });

  it('should request permissions and navigate on success', async () => {
    mockStorage.set.and.returnValue(Promise.resolve());

    await component.requestPermissions();

    expect(mockStorage.set).toHaveBeenCalledWith('onboarding_complete', true);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/tabs/home'], { replaceUrl: true });
  });

  it('should skip onboarding when requested', async () => {
    mockStorage.set.and.returnValue(Promise.resolve());

    await component.skipOnboarding();

    expect(mockStorage.set).toHaveBeenCalledWith('onboarding_complete', true);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/tabs/home'], { replaceUrl: true });
  });
});
