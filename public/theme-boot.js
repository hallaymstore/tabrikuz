/* Runs before first paint: apply the saved theme so night never flashes day,
   and mark low-power devices so heavy layers thin out instead of stopping. */
try{if(localStorage.getItem('tabrikuz-theme')==='night')document.documentElement.dataset.theme='night'}catch(e){}
(function(){var n=navigator,cores=n.hardwareConcurrency||8,mem=n.deviceMemory||8;
if(cores<=4||mem<=4)document.documentElement.classList.add('lite')})();
