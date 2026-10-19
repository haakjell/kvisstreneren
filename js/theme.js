// Light or dark ('light', 'dark', or null to follow the device) and the colour theme (one of PALETTES,
// Lyng when none is stored), as picked in Innstillinger. Loaded in <head>, before anything is drawn,
// so the page never flashes the other look; that is also why it reads localStorage itself (core.js's
// store comes later). themes.css and base.css hold the colours.
const PALETTES=['lyng','fjord','rabarbra','gran','multe'];
// The browser bar takes the page's background: each theme's --l-bg and --d-bg in themes.css
const THEME_BAR={
  lyng:{light:'#F0EDF6', dark:'#120E1B'}, fjord:{light:'#EBEFF4', dark:'#0C131D'}, rabarbra:{light:'#F6EEEF', dark:'#190F12'},
  gran:{light:'#ECF1EE', dark:'#0B1511'}, multe:{light:'#F8F0E7', dark:'#17100A'}
};
// p left out keeps the colour theme
function applyTheme(t,p){
  const root=document.documentElement;
  if(t==='light'||t==='dark') root.dataset.theme=t; else{ t=null; delete root.dataset.theme; }
  if(p!==undefined) root.dataset.palette=PALETTES.includes(p)?p:'lyng';
  const bar=THEME_BAR[root.dataset.palette];
  // Each meta is for its own prefers-color-scheme; a picked light or dark sets both
  document.querySelectorAll('meta[name="theme-color"]').forEach(m=>{ m.content=bar[t||(m.media.includes('dark')?'dark':'light')]; });
}
try{ applyTheme(localStorage.getItem('theme'),localStorage.getItem('palette')); }catch(e){ applyTheme(null,null); }
