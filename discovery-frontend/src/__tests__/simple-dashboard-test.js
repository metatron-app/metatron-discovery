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

describe('simple dashboard testing', () =>{

  let cookies;
  let browser;

  beforeAll(async () => {

    // console.log( '>>>>>>>> beforeAll' );

    browser = await puppeteer.launch({
      headless:false
    });

    const loginPage = await browser.newPage();
    await loginPage.goto('http://localhost:4200/app/v2/user/login');

    // login
    const adminId = 'admin';
    const adminPwd = 'admin';

    await loginPage.type('#loginId', adminId);
    await loginPage.type('#loginPwd', adminPwd);

    await loginPage.click('.ddp-btn'); // login button
    await loginPage.waitForResponse(response => {
      // console.log( '>>>>>>> response url - ' + response.url() + ' / status - ' + response.status() );
      return response.status() === 200 && response.url().includes('/api/workspaces/my');
    });

    // console.log( '>>>>>>>> before get cookie');

    // Get cookies
    cookies = await loginPage.cookies('http://localhost:4200');

    // console.log( '>>>>>>>> after get cookie - ' + JSON.stringify( cookies ) );

    await loginPage.close();

  });

  it('Load grid dashboard', async () => {

    // console.log('==== START : Load grid dashboard test');

    // Use cookies in other tab or browser
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 })
    await page.setCookie(...cookies);
    await page.goto('http://localhost:4200/app/v2/workbook/1964be68-a5a0-4cb5-a8b7-bc4579b5b90d');
    await page.waitForSelector('.ddp-box-widget .pivot-view > .pivot-view-body > .pivot-view-wrap');

    // 화면 캡쳐 및 비교
    const testImage = await page.screenshot({fullPage: true});
    expect(testImage).toMatchImageSnapshot(setSampleConfig('grid-board'));
    // console.log('==== END : Load grid dashboard test');

    await page.close();
  });

  afterAll(async () => {
    // console.log( '>>>>>>>> afterAll' );
    await browser.close();
  });
});


