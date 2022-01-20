describe('timer testing', () =>{
  it('timer Test', async ()=> {
    // console.log('==== TIMER TEST');
    jest.useFakeTimers();

    setTimeout(async ()=>{
      console.log('timer');
    }, 3000);

    jest.runAllTimers();

    // console.log('=== END OF TIMER TEST');
  });
});


