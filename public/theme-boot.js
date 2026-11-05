/* Apply the saved theme before first paint so night never flashes day. */
try{if(localStorage.getItem('tabrikuz-theme')==='night')document.documentElement.dataset.theme='night'}catch(e){}
