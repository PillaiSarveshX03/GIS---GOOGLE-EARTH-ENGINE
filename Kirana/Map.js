var ROI = ee.Geometry.Polygon([
  [
    [72.671736, 31.975039],  // Top Left
    [72.732983, 31.981686],  // Top Right
    [72.729194, 31.946222],  // Bottom Right
    [72.677297, 31.938739],  // Bottom Left
    [72.671736, 31.975039]   // Close polygon
  ]
]);

Map.centerObject(ROI, 14);
Map.addLayer(ROI, {color: 'red'}, 'ROI');


// IMAGE FINDING 


var landsat5 = ee.ImageCollection(
  'LANDSAT/LT05/C02/T1_L2'
);


var landsat1990 = landsat5
  .filterBounds(ROI)
  .filterDate(
    '1990-01-01',
    '1991-01-01'
  );

print(
  'Landsat 5 images over ROI in 1990:',
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
  .clip(ROI);

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
  'ROI 1990 CLEAN RGB'
);



// 2015



var landsat8 = ee.ImageCollection(
  'LANDSAT/LC08/C02/T1_L2'
);


var landsat2015 = landsat8
  .filterBounds(ROI)
  .filterDate(
    '2015-01-01',
    '2016-01-01'
  );

print(
  'Landsat 8 images over ROI in 2015:',
  landsat2015
);

print(
  'Number of 2015 Landsat images:',
  landsat2015.size()
);

print(
  '2015 cloud cover:',
  landsat2015.aggregate_array('CLOUD_COVER')
);


var landsat2015Clean = landsat2015
  .filter(
    ee.Filter.lt(
      'CLOUD_COVER',
      20
    )
  );

print(
  '2015 images below 20% cloud cover:',
  landsat2015Clean
);

print(
  'Number of 2015 images below 20% cloud:',
  landsat2015Clean.size()
);

print(
  'Selected 2015 cloud cover:',
  landsat2015Clean.aggregate_array('CLOUD_COVER')
);


function maskLandsat8(image) {

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

    // Keep useful Landsat 8 bands
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

    // Landsat Collection 2 Level 2
    // surface reflectance scaling
    .multiply(0.0000275)
    .add(-0.2);
}



var clean2015 = landsat2015Clean
  .map(maskLandsat8)
  .median()
  .clip(ROI);

Map.addLayer(
  clean2015,
  {
    bands: [
      'Red',
      'Green',
      'Blue'
    ],
    min: 0.03,
    max: 0.35
  },
  'ROI 2015 CLEAN RGB'
);

// 2025



var landsat9 = ee.ImageCollection(
  'LANDSAT/LC09/C02/T1_L2'
);


var landsat2025 = landsat9
  .filterBounds(ROI)
  .filterDate(
    '2025-01-01',
    '2026-01-01'
  );

print(
  'Landsat 9 images over ROI in 2025:',
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


function maskLandsat9(image) {

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

    // Keep useful Landsat 9 bands
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

    // Landsat Collection 2 Level 2
    // surface reflectance scaling
    .multiply(0.0000275)
    .add(-0.2);
}



var clean2025 = landsat2025Clean
  .map(maskLandsat9)
  .median()
  .clip(ROI);

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
  'ROI 2025 CLEAN RGB'
);

