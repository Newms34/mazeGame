/*info:
Name: name of creature
spawnChance = chance from 1-10 that this particular creature spawns in each 'mons' cell
hp: hitpoints. Generally, more hitpoints = tougher.
dmgL: low damage range cap.
dmgH: high damage range cap. The damage delt per turn is a rand number btwn this and dmgL.
dmgT: type of damage (poison, physical, fire, ice, holy, or dark)
res: resistances. If a creature with resistance to a particular dmg type is attacked by that dmg type, they take 30-50% less damage
maxDrop: maximum item level of dropped items. generally, higher hp creatures have higher maxDrops.
img: url of pic of beastie.
*/
var generalBeasts = [{
    name: 'Rat',
    spawnChance:8,
    hp: 3,
    dmgL: 2,
    dmgH: 5,
    dmgT:'pois',
    res: ['poison'],
    maxDrop: 1,
    img:''
},{
    name: 'Lesser Goblin',
    spawnChance:10,
    hp: 2,
    dmgL: 2,
    dmgH: 3,
    dmgT:'phys',
    res: ['dark'],
    maxDrop: 1,
    img:''
},{
    name: 'Cave Bat',
    spawnChance:6,
    hp: 5,
    dmgL: 5,
    dmgH: 6,
    dmgT:'phys',
    res: [],
    maxDrop: 2,
    img:''
},{
    name: 'Wendigo',
    spawnChance:5,
    hp: 8,
    dmgL: 8,
    dmgH: 10,
    dmgT:'ice',
    res: ['ice'],
    maxDrop: 4,
    img:''
},{
    name: 'Imp',
    spawnChance:5,
    hp: 8,
    dmgL: 8,
    dmgH: 10,
    dmgT:'fire',
    res: ['fire'],
    maxDrop: 4,
    img:''
},{
    name: 'Priest',
    spawnChance:3,
    hp: 3,
    dmgL: 4,
    dmgH: 20,
    dmgT:'holy',
    res: ['phys'],
    maxDrop: 6,
    img:''
},{
    name: 'Greater Goblin',
    spawnChance:4,
    hp: 3,
    dmgL: 8,
    dmgH: 12,
    dmgT:'dark',
    res: ['dark'],
    maxDrop: 7,
    img:''
}]
