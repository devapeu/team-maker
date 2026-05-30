// Colors converted from provided HSV values to hex RGB strings.
// Source HSV list (H, S%, V%):
// 240,80,100
// 0,100,100
// 60,90,100
// 119,80,100
// 185,80,100
// 300,100,100
// 32,87,100
// 339,82,56
// 159,100,74
// 15,52,100
// 273,95,99
// 0,0,100

export const COLORS = [
  '#3232ff',
  '#ff0000',
  '#ffff19',
  '#36ff32',
  '#32edff',
  '#ff00ff',
  '#ff9721',
  '#8e1942',
  '#00bc7a',
  '#e79478',
  '#900cfc',  
  '#808080',
];

export function getGodColor(god) {
  if (['zeus', 'hades', 'poseidon', 'demeter'].includes(god)) {
    return {
      border: '#67b0f9',
      background: '#258bdd'
    }
  }

  if (['ra', 'set', 'isis'].includes(god)) {
    return {
      border: '#e38422',
      background: '#df6920'
    }
  }

  if (['thor', 'odin', 'loki', 'freyr'].includes(god)) {
    return {
      border: '#dd5353',
      background: '#a55353'
    }
  }

  if (['kronos', 'oranos', 'gaia'].includes(god)) {
    return {
      border: '#4fcf91',
      background: '#16833a'
    }
  }

  if (['fuxi', 'shennong', 'nüwa'].includes(god)) {
    return {
      border: '#8e1e1e',
      background: '#591b1b'
    }
  }

  if (['amaterasu', 'susanoo', 'tsukuyomi'].includes(god)) {
    return {
      border: '#f87ec0',
      background: '#af2e78'
    }
  }

  if (['quetzalcoatl', 'huitzilopochtli', 'tezcatlipoca'].includes(god)) {
    return {
      border: '#b2ea53',
      background: '#8cc31e'
    }
  }
}

export function randomColor() {
	return COLORS[Math.floor(Math.random() * COLORS.length)];
}
