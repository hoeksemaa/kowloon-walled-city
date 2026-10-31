// Surface kinds, read by the facade shader (cityMesh.js), and the height of the plan cut.
export const CUT_H = 1.1; // height of the plan cut above a floor, metres

export const K = {
  wall: 0, plate: 1, roof: 2, alley: 3, parapet: 4, prop: 5, cage: 6, ac: 7,
  laundry: 8, sign: 9, tube: 10, plain: 11, poche: 12,
  stair: 13, // treads, risers, stringers and the wall between the flights (interiors.js)
  well: 14, // the walls of a stair well; the plan draws them on the cut storey
  furn: 15, // furniture and machines, on the cut storey only
  iwall: 16, // the faces of the walls inside a storey, on the cut storey only
  thing: 17, // pots, plants, boxes and bird cages kept in the window cages (facades.js)
  pipe: 18, // drain pipes and bundles of water pipes down the outer walls (facades.js)
  stain: 19, // a water stain on a wall, under an air-conditioner; it casts no shadow
};
