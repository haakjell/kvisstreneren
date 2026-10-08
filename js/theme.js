// Light or dark, as picked in Innstillinger: 'light', 'dark', or null to follow the device.
// Loaded in <head>, before anything is drawn, so the page never flashes the other theme; that is
// also why it reads localStorage itself (core.js's store comes later). base.css holds the colours.
const THEME_BAR={light:'#E4E9EE', dark:'#111922'};   // the browser bar, as in the theme-color metas
function applyTheme(t){
  const root=document.documentElement;
  if(t==='light'||t==='dark') root.dataset.theme=t; else{ t=null; delete root.dataset.theme; }
  // Each meta keeps its own colour for its prefers-color-scheme; a picked theme overrides both
  document.querySelectorAll('meta[name="theme-color"]').forEach(m=>{
    if(!m.dataset.auto) m.dataset.auto=m.content;
    m.content=t?THEME_BAR[t]:m.dataset.auto;
  });
}
try{ applyTheme(localStorage.getItem('theme')); }catch(e){}
