const puppeteer = require('puppeteer');
const {toMatchImageSnapshot} = require('jest-image-snapshot');

function setSampleConfig(filename){
  return {
    failureThreshold:'1', // 허용 오차
    failureThresholdType:'pixel',
    customSnapshotIdentifier: filename
  }
}

expect.extend({toMatchImageSnapshot})

describe('sample dashboard testing', () =>{

  let borwser;
  let page;

  beforeAll(async () => {

    browser = await puppeteer.launch({
      headless:false
    });

    page = await browser.newPage();
    await page.goto('http://localhost:4200/app/v2/user/login');

    // login
    const adminId = 'admin';
    const adminPwd = 'admin';

    await page.type('#loginId', adminId);
    await page.type('#loginPwd', adminPwd);

    await page.click('.ddp-btn'); // login button

    await page.waitForNavigation();

  });

  beforeEach(()=> {
    // 로그인 쿠키 처리


  })

  it('timer Test', async ()=> {
    console.log('==== TIMER TEST');
    jest.useFakeTimers();

    setTimeout(async ()=>{
      console.log('timer');
    }, 3000);

    jest.runAllTimers();

    console.log('=== END OF TIMER TEST');
  });

  it('Sample 1 Test', async () => {

    console.log('==== START TEST 1');
    //workspce로 이동
    // await page.goto('http://localhost:4200/app/v2/workbook/1964be68-a5a0-4cb5-a8b7-bc4579b5b90d');

    // await page.click('.ddp-btn-type-popup'); // popup close button

    // 화면 캡쳐 및 비교
    const testImage = await page.screenshot({fullPage: true});
    // expect(testImage).toMatchImageSnapshot(setSampleConfig('filename'));
    // expect(testImage).toMatchImageSnapshot({path:'./__image_snapshots__/example.png'});
    console.log('//----- End of Sample 1 --');
  });

  afterAll(async () => {
    // await browser.close();
  });

});

it('basic test', () => {
  expect(true).toBe(true);
});


