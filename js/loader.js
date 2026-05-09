// loader.js
document.addEventListener('DOMContentLoaded', async () => {

  const screens = [
    { id: 'setup-screen',  file: 'screens/setup.html'     },
    { id: 'rules-screen',  file: 'screens/rules.html'     },
    { id: 'place-screen',  file: 'screens/placement.html' },
    { id: 'game-screen',   file: 'screens/game.html'      },
    { id: 'modal-backdrop', file: 'screens/modal.html'    },
  ];

  await Promise.all(screens.map(async ({ id, file }) => {
    const res  = await fetch(file);
    const html = await res.text();
    document.getElementById(id).innerHTML = html;
  }));

  setTimeout(fillRulesPreviews, 100);
});