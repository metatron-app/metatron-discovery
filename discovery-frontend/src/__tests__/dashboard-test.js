const puppeteer = require('puppeteer');
const {toMatchImageSnapshot} = require('jest-image-snapshot');

function setSampleConfig(filename){
  return {
    failureThreshold:'2', // 허용 오차
    failureThresholdType:'pixel',
    customSnapshotIdentifier: filename
  }
}

expect.extend({toMatchImageSnapshot})

describe('dashboard testing', () => {

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

    // 0. open page and set cookies
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 })
    await page.setCookie(...cookies);

    // 1. move to my workspace
    await page.goto('http://localhost:4200');
    await page.waitForResponse(response => {
      // console.log( '>>>>>>> response url - ' + response.url() + ' / status - ' + response.status() );
      return response.status() === 200 && response.url().includes('/api/workspaces/my');
    });

    // 2. create workbook
    await page.waitForTimeout(1000);
    await page.click('.ddp-bottom-right > .ddp-btn-solid2:first-child');
    await page.type('app-create-workbook .ddp-wrap-edit2:first-child .ddp-input-type', 'TEST-WORKBOOK');
    await page.click('app-create-workbook .ddp-ui-buttons > .ddp-bg-black');

    // 3. create dashboard - select sales datasource
    await page.waitForSelector('create-board-ds-network');
    await page.click('create-board-ds-network .ddp-add-datasource');
    await page.waitForSelector('create-board-pop-ds-select #ds_sales_geo', { visible : true });
    await page.$eval('#ds_sales_geo', elm => elm.click());  // table row 는 이 방식만 click이 됨 page.click 은 안됨
    await page.waitForTimeout(1000);
    await page.click('create-board-pop-ds-select .ddp-ui-pop-buttons > .ddp-bg-black');
    await page.click('app-create-board .ddp-ui-buttons > .ddp-bg-black');

    // 3. create dashboard - input dashboard name & done
    await page.waitForSelector('create-board-complete .ddp-wrap-edit2', { visible : true });
    // await page.$$eval('create-board-complete .ddp-wrap-edit2 .ddp-input-type', elms => {
    //   elms[0].value = 'TEST-DASHBOARD';
    // }); <-- 이 방식은 버튼 활성이 안됨
    await page.type( 'create-board-complete .ddp-wrap-edit2 .ddp-input-type[placeholder="이름을 입력해 주세요"]', 'TEST-DASHBOARD' );
    await page.click('create-board-complete .ddp-ui-buttons > .ddp-bg-black');

    // 4. wait empty dashboard
    await page.waitForSelector('.ddp-img-nodata2', { visible : true });
    // 4-1. empty dashboard - initial capture
    // const emptyBoard = await page.$('div.ddp-ui-dash-contents.page-dashboard');
    // const emptyBoardImg = await emptyBoard.screenshot();
    // expect(emptyBoardImg).toMatchImageSnapshot(setSampleConfig('board-test-empty'));

    // 5. create widget & save dashboard
    await page.hover( '.ddp-btn-widget' );
    await page.click( '.ddp-btn-widget .ddp-list-popup li:first-child' ); // click chart edit component
    await page.waitForSelector('li[data-name=OrderDate][data-source=dimension]', { visible: true });
    await page.waitForTimeout(1000);
    await page.click( 'li[data-name=OrderDate][data-source=dimension]' );
    await page.click( 'li[data-name=Sales][data-source=measure]' );
    await page.click( '.ddp-list-chart-type li:nth-of-type(3)' );
    await page.waitForSelector('app-page line-chart canvas', { visible: true });
    await page.click( '.ddp-ui-buttons2 > .ddp-bg-black' ); // click create widget
    await page.waitForSelector('.ddp-view-widget-chart line-chart canvas', { visible: true });
    await page.click( '.ddp-btn-buttons2' );  // click save dashboard

    // 6. single widget dashboard - initial capture
    await page.waitForSelector('app-dashboard .ddp-view-widget-chart canvas', { visible : true });
    const singleWidgetBoard = await page.$('div.ddp-ui-dash-contents.page-dashboard');
    const singleWidgetBoardImg = await singleWidgetBoard.screenshot();
    expect(singleWidgetBoardImg).toMatchImageSnapshot(setSampleConfig('board-test-single-widget'));

    // 7. create second widget & save dashboard
    await page.hover( '.ddp-btn-widget' );
    await page.click( '.ddp-btn-widget .ddp-list-popup li:first-child' ); // click chart edit component
    await page.waitForSelector('li[data-name=OrderDate][data-source=dimension]', { visible: true });
    await page.waitForTimeout(1000);
    await page.click( 'li[data-name=OrderDate][data-source=dimension]' );
    await page.click( 'li[data-name=Sales][data-source=measure]' );
    await page.click( '.ddp-list-chart-type li:nth-of-type(1)' );
    await page.waitForSelector('app-page bar-chart canvas', { visible: true });
    await page.click( '.ddp-ui-buttons2 > .ddp-bg-black' ); // click create second widget
    await page.waitForSelector('.ddp-view-widget-chart bar-chart canvas', { visible: true });
    await page.click( '.ddp-btn-buttons2' );  // click save dashboard

    // 8. remove second widget & save dashboard
    await page.waitForSelector('app-dashboard .ddp-view-widget-chart canvas', { visible : true });
    await page.click( '.ddp-icon-board-edit' ); // click edit dashboard
    await page.waitForSelector('.ddp-view-widget-chart canvas', { visible: true });
    await page.hover( '.ddp-list-chart li:last-child a' );
    await page.click( '.ddp-list-chart li:last-child a .ddp-btn-control .ddp-icon-del-s' ); // delete second widget
    await page.waitForSelector('.ddp-box-popup .ddp-ui-buttons > .ddp-bg-black', { visible: true });  // wait show confirm popup
    await page.click( '.ddp-box-popup .ddp-ui-buttons > .ddp-bg-black' ); // click confirm
    await page.click( '.ddp-btn-buttons2' );  // click save dashboard

    // 9. single widget dashboard - compare capture
    await page.waitForSelector('app-dashboard .ddp-view-widget-chart canvas', { visible : true });
    const compareSingleWidgetBoard = await page.$('div.ddp-ui-dash-contents.page-dashboard');
    const compareSingleWidgetBoardImg = await compareSingleWidgetBoard.screenshot();
    expect(compareSingleWidgetBoardImg).toMatchImageSnapshot(setSampleConfig('board-test-single-widget'));

    // 10. remove workbook
    await page.click( '.ddp-lnb-dashboard .ddp-icon-more' );
    await page.waitForSelector( '.ddp-popup-lnbmore li:last-child a', { visible : true } );
    await page.click( '.ddp-popup-lnbmore li:last-child a' );
    await page.waitForSelector( '.ddp-box-popup .ddp-ui-buttons > .ddp-bg-black', { visible : true } );
    await page.click( '.ddp-box-popup .ddp-ui-buttons > .ddp-bg-black' );
    await page.waitForSelector( 'app-workspace .page-workspace', { visible : true } );

    await page.close();
  });

  afterAll(async () => {
    // console.log( '>>>>>>>> afterAll' );
    await browser.close();
  });
});


