var KL_ROI = ee.Geometry.Rectangle([
  101.50, 2.95,
  101.90, 3.40
]);

Map.centerObject(KL_ROI, 10);

Map.addLayer(
  KL_ROI,
  {color: 'yellow'},
  'Kuala Lumpur Study Area'
);


var landsat5 = ee.ImageCollection(
  'LANDSAT/LT05/C02/T1_L2'
);


var landsat1990 = landsat5
  .filterBounds(KL_ROI)
  .filterDate(
    '1990-01-01',
    '1991-01-01'
  );

print(
  'Landsat 5 images over Kuala Lumpur in 1990:',
  landsat1990
);

print(
  'Number of 1990 Landsat images:',
  landsat1990.size()
);

print(
  '1990 cloud cover:',
  landsat1990.aggregate_array('CLOUD_COVER')
);

var landsat1990Clean = landsat1990
  .filter(
    ee.Filter.lt(
      'CLOUD_COVER',
      20
    )
  );

print(
  '1990 images below 20% cloud cover:',
  landsat1990Clean
);

print(
  'Number of 1990 images below 20% cloud:',
  landsat1990Clean.size()
);

print(
  'Selected 1990 cloud cover:',
  landsat1990Clean.aggregate_array('CLOUD_COVER')
);


function maskLandsat5(image) {

  var qa = image.select('QA_PIXEL');

  // QA_PIXEL bits:
  //
  // Bit 1 = Dilated cloud
  // Bit 3 = Cloud
  // Bit 4 = Cloud shadow
  // Bit 5 = Snow

  var mask = qa
    .bitwiseAnd(1 << 1)
    .eq(0)
    .and(
      qa.bitwiseAnd(1 << 3).eq(0)
    )
    .and(
      qa.bitwiseAnd(1 << 4).eq(0)
    )
    .and(
      qa.bitwiseAnd(1 << 5).eq(0)
    );

  return image
    .updateMask(mask)

    // Keep useful Landsat 5 bands
    .select(
      [
        'SR_B1',
        'SR_B2',
        'SR_B3',
        'SR_B4',
        'SR_B5',
        'SR_B7'
      ],
      [
        'Blue',
        'Green',
        'Red',
        'NIR',
        'SWIR1',
        'SWIR2'
      ]
    )

    // Landsat Collection 2 Level 2
    // surface reflectance scaling
    .multiply(0.0000275)
    .add(-0.2);
}



var clean1990 = landsat1990Clean
  .map(maskLandsat5)
  .median()
  .clip(KL_ROI);

Map.addLayer(
  clean1990,
  {
    bands: [
      'Red',
      'Green',
      'Blue'
    ],
    min: 0.03,
    max: 0.35
  },
  'Kuala Lumpur 1990 CLEAN RGB'
);


var landsat8 = ee.ImageCollection(
  'LANDSAT/LC08/C02/T1_L2'
);


var landsat9 = ee.ImageCollection(
  'LANDSAT/LC09/C02/T1_L2'
);

var landsat89 = landsat8.merge(
  landsat9
);



var landsat2025 = landsat89
  .filterBounds(KL_ROI)
  .filterDate(
    '2025-01-01',
    '2026-01-01'
  );

print(
  'Landsat 8/9 images over Kuala Lumpur in 2025:',
  landsat2025
);

print(
  'Number of 2025 Landsat images:',
  landsat2025.size()
);

print(
  '2025 cloud cover:',
  landsat2025.aggregate_array('CLOUD_COVER')
);




var landsat2025Clean = landsat2025
  .filter(
    ee.Filter.lt(
      'CLOUD_COVER',
      20
    )
  );

print(
  '2025 images below 20% cloud cover:',
  landsat2025Clean
);

print(
  'Number of 2025 images below 20% cloud:',
  landsat2025Clean.size()
);

print(
  'Selected 2025 cloud cover:',
  landsat2025Clean.aggregate_array('CLOUD_COVER')
);

function maskLandsat89(image) {

  var qa = image.select('QA_PIXEL');

  // QA_PIXEL bits:
  //
  // Bit 1 = Dilated cloud
  // Bit 2 = Cirrus
  // Bit 3 = Cloud
  // Bit 4 = Cloud shadow
  // Bit 5 = Snow

  var mask = qa
    .bitwiseAnd(1 << 1)
    .eq(0)
    .and(
      qa.bitwiseAnd(1 << 2).eq(0)
    )
    .and(
      qa.bitwiseAnd(1 << 3).eq(0)
    )
    .and(
      qa.bitwiseAnd(1 << 4).eq(0)
    )
    .and(
      qa.bitwiseAnd(1 << 5).eq(0)
    );

  return image
    .updateMask(mask)

    // Landsat 8/9 bands
    .select(
      [
        'SR_B2',
        'SR_B3',
        'SR_B4',
        'SR_B5',
        'SR_B6',
        'SR_B7'
      ],
      [
        'Blue',
        'Green',
        'Red',
        'NIR',
        'SWIR1',
        'SWIR2'
      ]
    )

    // Surface reflectance scaling
    .multiply(0.0000275)
    .add(-0.2);
}

var clean2025 = landsat2025Clean
  .map(maskLandsat89)
  .median()
  .clip(KL_ROI);

Map.addLayer(
  clean2025,
  {
    bands: [
      'Red',
      'Green',
      'Blue'
    ],
    min: 0.03,
    max: 0.35
  },
  'Kuala Lumpur 2025 CLEAN RGB'
);


var ndvi1990 = clean1990
  .normalizedDifference([
    'NIR',
    'Red'
  ])
  .rename('NDVI_1990');


var ndvi2025 = clean2025
  .normalizedDifference([
    'NIR',
    'Red'
  ])
  .rename('NDVI_2025');

var ndviVis = {
  min: -0.2,
  max: 0.8,
  palette: [
    'brown',
    'yellow',
    'lightgreen',
    'green',
    'darkgreen'
  ]
};



Map.addLayer(
  ndvi1990,
  ndviVis,
  'Kuala Lumpur NDVI 1990'
);

Map.addLayer(
  ndvi2025,
  ndviVis,
  'Kuala Lumpur NDVI 2025'
);

var ndviChange = ndvi2025
  .subtract(ndvi1990)
  .rename('NDVI_Change_1990_2025');

var ndviChangeVis = {
  min: -0.5,
  max: 0.5,
  palette: [
    'red',
    'white',
    'green'
  ]
};

Map.addLayer(
  ndviChange,
  ndviChangeVis,
  'NDVI Change 1990-2025'
);


var ndbi1990 = clean1990
  .normalizedDifference([
    'SWIR1',
    'NIR'
  ])
  .rename('NDBI_1990');

var ndbi2025 = clean2025
  .normalizedDifference([
    'SWIR1',
    'NIR'
  ])
  .rename('NDBI_2025');


var ndbiVis = {
  min: -0.4,
  max: 0.4,
  palette: [
    'green',
    'white',
    'red'
  ]
};


Map.addLayer(
  ndbi1990,
  ndbiVis,
  'Kuala Lumpur NDBI 1990'
);

Map.addLayer(
  ndbi2025,
  ndbiVis,
  'Kuala Lumpur NDBI 2025'
);


var ndbiChange = ndbi2025
  .subtract(ndbi1990)
  .rename('NDBI_Change_1990_2025');

var ndbiChangeVis = {
  min: -0.4,
  max: 0.4,
  palette: [
    'blue',
    'white',
    'red'
  ]
};

Map.addLayer(
  ndbiChange,
  ndbiChangeVis,
  'NDBI Change 1990-2025'
);


var ndviChange = ndvi2025
  .subtract(ndvi1990)
  .rename('NDVI_Change');

var ndbiChange = ndbi2025
  .subtract(ndbi1990)
  .rename('NDBI_Change');


var builtUp2025 = ndbi2025
  .gt(0.05)
  .rename('BuiltUp_2025');


var vegetationLoss = ndviChange
  .lt(-0.25)
  .rename('Vegetation_Loss');

var builtUpIncrease = ndbiChange
  .gt(0.15)
  .rename('BuiltUp_Increase');

var potentialUrbanConversion =
  vegetationLoss
  .and(builtUpIncrease)
  .and(builtUp2025)
  .rename('Potential_Urban_Conversion');


Map.addLayer(
  ndviChange,
  {
    min: -0.5,
    max: 0.5,
    palette: [
      'red',
      'white',
      'green'
    ]
  },
  'NDVI Change 1990-2025'
);

Map.addLayer(
  vegetationLoss.selfMask(),
  {
    palette: ['orange']
  },
  'Significant Vegetation Loss'
);


Map.addLayer(
  builtUpIncrease.selfMask(),
  {
    palette: ['blue']
  },
  'Significant Built-up Increase'
);

Map.addLayer(
  potentialUrbanConversion.selfMask(),
  {
    palette: ['red']
  },
  'Potential Vegetation to Urban Conversion'
);



