import { Fact, Mission, Moon } from './types';

export const JUPITER_FACTS: Fact[] = [
  {
    id: 'mass',
    title: 'Mass',
    value: '317.8 Earths',
    description: 'More than twice as massive as all the other planets combined.',
    icon: 'scale',
  },
  {
    id: 'radius',
    title: 'Equatorial Radius',
    value: '69,911 km',
    description: '11.2 times the radius of Earth.',
    icon: 'ruler',
  },
  {
    id: 'day',
    title: 'Length of Day',
    value: '9h 55m',
    description: 'The shortest day of any planet in the Solar System.',
    icon: 'clock',
  },
  {
    id: 'temp',
    title: 'Average Temp',
    value: '-110°C',
    description: 'Temperature at 1 bar of atmospheric pressure.',
    icon: 'thermometer',
  },
];

export const JUPITER_MOONS: Moon[] = [
  {
    id: 'io',
    name: 'Io',
    description: 'The most volcanically active body in the Solar System.',
    radius: '1,821.6 km',
    distance: '421,700 km',
    imageColor: '#F4D03F', // Sulfur yellow
    texture: '/textures/Moons/io-moon.jpg',
  },
  {
    id: 'europa',
    name: 'Europa',
    description: 'Smooth icy surface with a subsurface ocean twice the volume of Earths.',
    radius: '1,560.8 km',
    distance: '671,100 km',
    imageColor: '#D6EAF8', // Ice blue
    texture: '/textures/Moons/europa-moon.jpg',
  },
  {
    id: 'ganymede',
    name: 'Ganymede',
    description: 'The largest moon in the Solar System, larger than Mercury.',
    radius: '2,634.1 km',
    distance: '1,070,400 km',
    imageColor: '#AAB7B8', // Rocky grey
    texture: '/textures/Moons/ganymede-moon.jpg',
  },
  {
    id: 'callisto',
    name: 'Callisto',
    description: 'The most heavily cratered object in the Solar System.',
    radius: '2,410.3 km',
    distance: '1,882,700 km',
    imageColor: '#5D6D7E', // Dark cratered
    texture: '/textures/Moons/callisto-moon.jpg',
  },
];

export const MISSIONS: Mission[] = [
  { year: '1610', name: 'Galileo Discovery', description: 'Galileo Galilei discovers the four main moons.' },
  { year: '1973', name: 'Pioneer 10', description: 'First spacecraft to fly past Jupiter.' },
  { year: '1979', name: 'Voyager 1 & 2', description: 'Discovered the rings and volcanic activity on Io.' },
  { year: '1995', name: 'Galileo Orbiter', description: 'First spacecraft to orbit Jupiter.' },
  { year: '2016', name: 'Juno', description: 'Current mission studying gravity and magnetic fields.' },
  { year: '2030s', name: 'JUICE & Clipper', description: 'Upcoming missions to explore icy moons.' },
];
