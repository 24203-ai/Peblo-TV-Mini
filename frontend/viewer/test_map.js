import fs from 'fs';

// Very basic test for the mapping logic
const catalogue = JSON.parse(fs.readFileSync('../../assets/catalogue.json', 'utf-8'));

const featuredShows = catalogue['featured'] || [];
const heroShow = featuredShows.length > 0 ? featuredShows[0] : null;

try {
  Object.entries(catalogue).map(([section, shows]) => {
    if (section === 'featured' && shows.length <= 1) return null;
    
    shows.map((show) => {
      if (heroShow && show.id === heroShow.id) return null;
      let x = show.artwork?.poster || '';
      let y = show.title;
    });
  });
  console.log("NO ERRORS IN MAPPING!");
} catch (e) {
  console.error("ERROR IN MAPPING:", e);
}
