import { TestBed } from '@angular/core/testing';
import { ConverterService } from './converter.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { Currency } from 'src/app/model/asset.model';
describe('ConverterService', () => {
  let service: ConverterService;
  let httpClient: HttpClient
  let httpController: HttpTestingController
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ]
    }).compileComponents();
    service = TestBed.inject(ConverterService);
    httpClient = TestBed.inject(HttpClient);
    httpController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should convert SGD to IDR', (done: DoneFn) => {
    
    service.getRate(Currency.SGD, Currency.IDR).then((rate) => {
      expect(rate).toEqual(10610.9028)
      done();
    })

    const req = httpController.expectOne(`https://api.exchangerate.host/latest?base=${Currency.SGD}&symbols=${Currency.IDR}`)
    req.flush(
      {
        "motd": {
          "msg": "If you or your company use this project or like what we doing, please consider backing us so we can continue maintaining and evolving this project.",
          "url": "https://exchangerate.host/#/donate"
        },
        "success": true,
        "base": "SGD",
        "date": "2022-06-16",
        "rates":
        {
          "IDR": 10610.9028
        }
      }
    )
  })

});
