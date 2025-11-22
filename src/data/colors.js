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
  '#cbcb16',
  '#36ff32',
  '#32edff',
  '#ff00ff',
  '#f39429',
  '#8b1640',
  '#00bc7a',
  '#e79478ff',
  '#900cfc',  
  '#808080',
];

export function randomColor() {
	return COLORS[Math.floor(Math.random() * COLORS.length)];
}
