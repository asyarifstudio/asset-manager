import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UtilService } from './util.service';
import { ConverterService } from '../converter/converter.service';
import { Asset, Currency } from 'src/app/model/asset.model';

describe('UtilService', () => {
  let service: UtilService;
  let converterSpy:jasmine.SpyObj<ConverterService>;

  const assets:Asset[] = [
    {
      name:"Asset 1",
      id:"1",
      currency:Currency.IDR,
      entries:[
        {
          amount:10000,
          month:1,
          year:2022
        },
        {
          amount:5000,
          month:2,
          year:2022
        }
      ]
    },
    {
      name:"Asset 2",
      id:"2",
      currency:Currency.SGD,
      entries:[
        {
          amount:20,
          month:0,
          year:2022
        },
        {
          amount:50,
          month:2,
          year:2022
        }
      ]
    }

  ]

  beforeEach(() => {
    const spy = jasmine.createSpyObj('ConverterService',['getRate'])
    TestBed.configureTestingModule({
      providers:[
        {
          provide:ConverterService,
          useValue:spy
        }
      ]
    }).compileComponents();
    service = TestBed.inject(UtilService);
    converterSpy = TestBed.inject(ConverterService) as jasmine.SpyObj<ConverterService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should summarize the result', (done:DoneFn)=>{
    converterSpy.getRate.and.returnValue(new Promise<number>((resolve)=>resolve(10000)));
    service.summarizeAsset(assets).then((summary)=>{
      //expect the get rate called once for SGD to IDR
      expect(converterSpy.getRate.calls.count()).toBe(1);

      //expect the monthly to be 2
      expect(summary.monthly.length).toBe(3);

      //expect data in first month
      expect(summary.monthly[0].month).toBe(2)
      expect(summary.monthly[0].year).toBe(2022)
      expect(summary.monthly[0].assetValue.get("1")).toBeDefined();
      expect(summary.monthly[0].assetValue.get("1")?.amount).toBe(5000);
      expect(summary.monthly[0].assetValue.get("1")?.amountIDR).toBe(5000);
      expect(summary.monthly[0].assetValue.get("1")?.name).toBe('Asset 1');
      expect(summary.monthly[0].assetValue.get("2")).toBeDefined();
      expect(summary.monthly[0].assetValue.get("2")?.amount).toBe(50);
      expect(summary.monthly[0].assetValue.get("2")?.amountIDR).toBe(500000);
      expect(summary.monthly[0].assetValue.get("2")?.name).toBe('Asset 2');
      //expect increment in the first month
      expect(summary.monthly[0].increment.get('TOTAL')).toBeDefined();
      expect(summary.monthly[0].increment.get('TOTAL')?.total).toBe(505000);
      expect(summary.monthly[0].increment.get('TOTAL')?.monthlyInc).toBe(495000);
      expect(summary.monthly[0].increment.get('TOTAL')?.monthlyIncPer).toBe(4950);
      expect(summary.monthly[0].increment.get('TOTAL')?.yearToDateInc).toBe(305000);
      expect(summary.monthly[0].increment.get('TOTAL')?.yearToDateIncPer).toBe(152.5);
      expect(summary.monthly[0].increment.get('TOTAL')?.overallInc).toBe(305000);
      expect(summary.monthly[0].increment.get('TOTAL')?.overallIncPer).toBe(152.5);
      expect(summary.monthly[0].increment.get(Currency.SGD)).toBeDefined();
      expect(summary.monthly[0].increment.get(Currency.SGD)?.total).toBe(500000);
      expect(summary.monthly[0].increment.get(Currency.SGD)?.monthlyInc).toBe(500000);
      expect(summary.monthly[0].increment.get(Currency.SGD)?.monthlyIncPer).toBe(100);
      expect(summary.monthly[0].increment.get(Currency.SGD)?.yearToDateInc).toBe(300000);
      expect(summary.monthly[0].increment.get(Currency.SGD)?.yearToDateIncPer).toBe(150);
      expect(summary.monthly[0].increment.get(Currency.SGD)?.overallInc).toBe(300000);
      expect(summary.monthly[0].increment.get(Currency.SGD)?.overallIncPer).toBe(150);
      expect(summary.monthly[0].increment.get(Currency.IDR)).toBeDefined();
      expect(summary.monthly[0].increment.get(Currency.IDR)?.total).toBe(5000);
      expect(summary.monthly[0].increment.get(Currency.IDR)?.monthlyInc).toBe(-5000);
      expect(summary.monthly[0].increment.get(Currency.IDR)?.monthlyIncPer).toBe(-50);
      expect(summary.monthly[0].increment.get(Currency.IDR)?.yearToDateInc).toBe(5000);
      expect(summary.monthly[0].increment.get(Currency.IDR)?.yearToDateIncPer).toBe(100);
      expect(summary.monthly[0].increment.get(Currency.IDR)?.overallInc).toBe(5000);
      expect(summary.monthly[0].increment.get(Currency.IDR)?.overallIncPer).toBe(100);
      
      //expect result in Second month
      expect(summary.monthly[1].month).toBe(1)
      expect(summary.monthly[1].year).toBe(2022)
      expect(summary.monthly[1].assetValue.get("1")).toBeDefined();
      expect(summary.monthly[1].assetValue.get("1")?.amount).toBe(10000);
      expect(summary.monthly[1].assetValue.get("1")?.amountIDR).toBe(10000);
      expect(summary.monthly[1].assetValue.get("1")?.name).toBe('Asset 1');
      expect(summary.monthly[1].assetValue.get("2")).toBeUndefined();
      //expect increment in the first month
      expect(summary.monthly[1].increment.get('TOTAL')).toBeDefined();
      expect(summary.monthly[1].increment.get('TOTAL')?.total).toBe(10000);
      expect(summary.monthly[1].increment.get('TOTAL')?.monthlyInc).toBe(-190000);
      expect(summary.monthly[1].increment.get('TOTAL')?.monthlyIncPer).toBe(-95);
      expect(summary.monthly[1].increment.get('TOTAL')?.yearToDateInc).toBe(-190000);
      expect(summary.monthly[1].increment.get('TOTAL')?.yearToDateIncPer).toBe(-95);
      expect(summary.monthly[1].increment.get('TOTAL')?.overallInc).toBe(-190000);
      expect(summary.monthly[1].increment.get('TOTAL')?.overallIncPer).toBe(-95);
      expect(summary.monthly[1].increment.get(Currency.SGD)).toBeDefined();
      expect(summary.monthly[1].increment.get(Currency.SGD)?.total).toBe(0);
      expect(summary.monthly[1].increment.get(Currency.SGD)?.monthlyInc).toBe(-200000);
      expect(summary.monthly[1].increment.get(Currency.SGD)?.monthlyIncPer).toBe(-100);
      expect(summary.monthly[1].increment.get(Currency.SGD)?.yearToDateInc).toBe(-200000);
      expect(summary.monthly[1].increment.get(Currency.SGD)?.yearToDateIncPer).toBe(-100);
      expect(summary.monthly[1].increment.get(Currency.SGD)?.overallInc).toBe(-200000);
      expect(summary.monthly[1].increment.get(Currency.SGD)?.overallIncPer).toBe(-100);
      expect(summary.monthly[1].increment.get(Currency.IDR)).toBeDefined();
      expect(summary.monthly[1].increment.get(Currency.IDR)?.total).toBe(10000);
      expect(summary.monthly[1].increment.get(Currency.IDR)?.monthlyInc).toBe(10000);
      expect(summary.monthly[1].increment.get(Currency.IDR)?.monthlyIncPer).toBe(100);
      expect(summary.monthly[1].increment.get(Currency.IDR)?.yearToDateInc).toBe(10000);
      expect(summary.monthly[1].increment.get(Currency.IDR)?.yearToDateIncPer).toBe(100);
      expect(summary.monthly[1].increment.get(Currency.IDR)?.overallInc).toBe(10000);
      expect(summary.monthly[1].increment.get(Currency.IDR)?.overallIncPer).toBe(100);

      //expect data in first month
      expect(summary.monthly[2].month).toBe(0)
      expect(summary.monthly[2].year).toBe(2022)
      expect(summary.monthly[2].assetValue.get("1")).toBeUndefined();
      expect(summary.monthly[2].assetValue.get("2")).toBeDefined();
      expect(summary.monthly[2].assetValue.get("2")?.amount).toBe(20);
      expect(summary.monthly[2].assetValue.get("2")?.amountIDR).toBe(200000);
      expect(summary.monthly[2].assetValue.get("2")?.name).toBe('Asset 2');
      //expect increment in the first month
      expect(summary.monthly[2].increment.get('TOTAL')).toBeDefined();
      expect(summary.monthly[2].increment.get('TOTAL')?.total).toBe(200000);
      expect(summary.monthly[2].increment.get('TOTAL')?.monthlyInc).toBe(0);
      expect(summary.monthly[2].increment.get('TOTAL')?.monthlyIncPer).toBe(0);
      expect(summary.monthly[2].increment.get('TOTAL')?.yearToDateInc).toBe(0);
      expect(summary.monthly[2].increment.get('TOTAL')?.yearToDateIncPer).toBe(0);
      expect(summary.monthly[2].increment.get('TOTAL')?.overallInc).toBe(0);
      expect(summary.monthly[2].increment.get('TOTAL')?.overallIncPer).toBe(0);
      expect(summary.monthly[2].increment.get(Currency.SGD)).toBeDefined();
      expect(summary.monthly[2].increment.get(Currency.SGD)?.total).toBe(200000);
      expect(summary.monthly[2].increment.get(Currency.SGD)?.monthlyInc).toBe(0);
      expect(summary.monthly[2].increment.get(Currency.SGD)?.monthlyIncPer).toBe(0);
      expect(summary.monthly[2].increment.get(Currency.SGD)?.yearToDateInc).toBe(0);
      expect(summary.monthly[2].increment.get(Currency.SGD)?.yearToDateIncPer).toBe(0);
      expect(summary.monthly[2].increment.get(Currency.SGD)?.overallInc).toBe(0);
      expect(summary.monthly[2].increment.get(Currency.SGD)?.overallIncPer).toBe(0);
      expect(summary.monthly[2].increment.get(Currency.IDR)).toBeDefined();
      expect(summary.monthly[2].increment.get(Currency.IDR)?.total).toBe(0);
      expect(summary.monthly[2].increment.get(Currency.IDR)?.monthlyInc).toBe(0);
      expect(summary.monthly[2].increment.get(Currency.IDR)?.monthlyIncPer).toBe(0);
      expect(summary.monthly[2].increment.get(Currency.IDR)?.yearToDateInc).toBe(0);
      expect(summary.monthly[2].increment.get(Currency.IDR)?.yearToDateIncPer).toBe(0);
      expect(summary.monthly[2].increment.get(Currency.IDR)?.overallInc).toBe(0);
      expect(summary.monthly[2].increment.get(Currency.IDR)?.overallIncPer).toBe(0);

      done();
    })
  })


});
