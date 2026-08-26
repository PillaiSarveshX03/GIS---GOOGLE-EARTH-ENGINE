// =========================================================================
// REGION OF INTEREST (ROI) - Sargodha / Kirana Hills Region
// =========================================================================
var ROI = ee.Geometry.Polygon([
  [
    [72.671736, 31.975039],  // Top Left
    [72.732983, 31.981686],  // Top Right
    [72.729194, 31.946222],  // Bottom Right
    [72.677297, 31.938739],  // Bottom Left
    [72.671736, 31.975039]   // Close polygon
  ]
]);

Map.centerObject(ROI, 13);
Map.addLayer(ROI, {color: 'red'}, 'ROI Boundary');

// =========================================================================
// STANDARDIZED TEMPORAL WINDOW: Post-Monsoon / Kharif Peak (Sep 01 - Nov 30)
// =========================================================================
var startWindow = '-09-01';
var endWindow   = '-11-30';

// Coordinate Reference System for Punjab, Pakistan (UTM Zone 43N)
var EXPORT_CRS = 'EPSG:32643';

// =========================================================================
// 1. CLOUD MASKING & BAND STANDARDIZATION FUNCTIONS
// =========================================================================

// Landsat 5 Surface Reflectance (Collection 2, Tier 1)
function maskAndPrepLandsat5(image) {
  var qa = image.select('QA_PIXEL');
  var bitMask = (1 << 1) | (1 << 3) | (1 << 4) | (1 << 5);
  var clearMask = qa.bitwiseAnd(bitMask).eq(0);
  
  var opticalBands = image.select(
    ['SR_B1', 'SR_B2', 'SR_B3', 'SR_B4', 'SR_B5', 'SR_B7'],
    ['Blue', 'Green', 'Red', 'NIR', 'SWIR1', 'SWIR2']
  ).multiply(0.0000275).add(-0.2);
  
  return opticalBands
    .updateMask(clearMask)
    .copyProperties(image, ['system:time_start']);
}

// Sentinel-2 L1C Harmonized Reflectance
function maskAndPrepSentinel2(image) {
  var qa = image.select('QA60');
  var clearMask = qa.bitwiseAnd(1 << 10).eq(0)
                    .and(qa.bitwiseAnd(1 << 11).eq(0));
  
  var opticalBands = image.select(
    ['B2', 'B3', 'B4', 'B8', 'B11', 'B12'],
    ['Blue', 'Green', 'Red', 'NIR', 'SWIR1', 'SWIR2']
  ).divide(10000);
  
  return opticalBands
    .updateMask(clearMask)
    .copyProperties(image, ['system:time_start']);
}

// =========================================================================
// 2. COMPOSITING (Clean True-Color Surface Reflectance)
// =========================================================================

// 1990 Landsat 5 Composite
var clean1990 = ee.ImageCollection('LANDSAT/LT05/C02/T1_L2')
  .filterBounds(ROI)
  .filterDate('1990' + startWindow, '1990' + endWindow)
  .filter(ee.Filter.lt('CLOUD_COVER', 30))
  .map(maskAndPrepLandsat5)
  .median()
  .clip(ROI);

// 2015 Sentinel-2 Composite
var clean2015 = ee.ImageCollection('COPERNICUS/S2_HARMONIZED')
  .filterBounds(ROI)
  .filterDate('2015' + startWindow, '2015' + endWindow)
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 30))
  .map(maskAndPrepSentinel2)
  .median()
  .clip(ROI);

// 2025 Sentinel-2 Composite
var clean2025 = ee.ImageCollection('COPERNICUS/S2_HARMONIZED')
  .filterBounds(ROI)
  .filterDate('2025' + startWindow, '2025' + endWindow)
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 30))
  .map(maskAndPrepSentinel2)
  .median()
  .clip(ROI);

// =========================================================================
// 3. INDEX & CHANGE CALCULATIONS (NDVI, NDBI & Transitions)
// =========================================================================

// NDVI
var ndvi1990 = clean1990.normalizedDifference(['NIR', 'Red']).rename('NDVI_1990');
var ndvi2015 = clean2015.normalizedDifference(['NIR', 'Red']).rename('NDVI_2015');
var ndvi2025 = clean2025.normalizedDifference(['NIR', 'Red']).rename('NDVI_2025');

// NDBI
var ndbi1990 = clean1990.normalizedDifference(['SWIR1', 'NIR']).rename('NDBI_1990');
var ndbi2015 = clean2015.normalizedDifference(['SWIR1', 'NIR']).rename('NDBI_2015');
var ndbi2025 = clean2025.normalizedDifference(['SWIR1', 'NIR']).rename('NDBI_2025');

// Long-term Changes (1990 -> 2025)
var ndviChange = ndvi2025.subtract(ndvi1990).rename('NDVI_Change');
var ndbiChange = ndbi2025.subtract(ndbi1990).rename('NDBI_Change');

// Significant Feature Detections
var significantVegetationLoss  = ndviChange.lt(-0.2);
var significantBuiltUpIncrease = ndbiChange.gt(0.2);
var potentialUrbanConversion   = significantVegetationLoss.and(significantBuiltUpIncrease);

// =========================================================================
// 4. MAP VISUALIZATION PALETTES & LAYERS
// =========================================================================

var rgbVis  = { bands: ['Red', 'Green', 'Blue'], min: 0.03, max: 0.35 };
var ndviVis = { min: -0.1, max: 0.7, palette: ['#d7191c', '#fdae61', '#ffffbf', '#a6d96a', '#1a9641'] };
var ndbiVis = { min: -0.3, max: 0.3, palette: ['#08519c', '#6baed6', '#fee391', '#fe9929', '#d94701', '#800026'] };
var changeVis = { min: -0.5, max: 0.5, palette: ['#d7191c', '#ffffff', '#1a9641'] };

// RGB
Map.addLayer(clean1990, rgbVis, '1990 Clean RGB (Sep-Nov)', false);
Map.addLayer(clean2015, rgbVis, '2015 Clean RGB (Sep-Nov)', false);
Map.addLayer(clean2025, rgbVis, '2025 Clean RGB (Sep-Nov)', false);

// NDVI
Map.addLayer(ndvi1990, ndviVis, '1990 NDVI', false);
Map.addLayer(ndvi2015, ndviVis, '2015 NDVI', false);
Map.addLayer(ndvi2025, ndviVis, '2025 NDVI', false);

// NDBI
Map.addLayer(ndbi1990, ndbiVis, '1990 NDBI', false);
Map.addLayer(ndbi2015, ndbiVis, '2015 NDBI', false);
Map.addLayer(ndbi2025, ndbiVis, '2025 NDBI', false);

// Changes & Masking
Map.addLayer(ndviChange, changeVis, 'NDVI Change (1990-2025)', false);
Map.addLayer(ndbiChange, changeVis, 'NDBI Change (1990-2025)', false);
Map.addLayer(potentialUrbanConversion.selfMask(), {palette: ['red']}, 'Potential Urban/Barren Conversion');

// =========================================================================
// 5. DIRECT DOWNLOAD URLS (GeoTIFF For QGIS)
// =========================================================================

// --- 5A. RGB COMPOSITES (Packaged as UInt16 Multi-band GeoTIFF) ---

var rgbPrep1990 = clean1990.select(['Red', 'Green', 'Blue']).clamp(0, 1).multiply(10000).toUint16();
var rgbPrep2015 = clean2015.select(['Red', 'Green', 'Blue']).clamp(0, 1).multiply(10000).toUint16();
var rgbPrep2025 = clean2025.select(['Red', 'Green', 'Blue']).clamp(0, 1).multiply(10000).toUint16();

print('DOWNLOAD 1990 RGB (30m):', rgbPrep1990.getDownloadURL({
  name: 'ROI_1990_RGB',
  region: ROI,
  scale: 30,
  crs: EXPORT_CRS,
  format: 'GEO_TIFF',
  filePerBand: false
}));

print('DOWNLOAD 2015 RGB (10m):', rgbPrep2015.getDownloadURL({
  name: 'ROI_2015_RGB',
  region: ROI,
  scale: 10,
  crs: EXPORT_CRS,
  format: 'GEO_TIFF',
  filePerBand: false
}));

print('DOWNLOAD 2025 RGB (10m):', rgbPrep2025.getDownloadURL({
  name: 'ROI_2025_RGB',
  region: ROI,
  scale: 10,
  crs: EXPORT_CRS,
  format: 'GEO_TIFF',
  filePerBand: false
}));

// --- 5B. NDVI DOWNLOADS ---

print('DOWNLOAD NDVI 1990:', ndvi1990.getDownloadURL({
  name: 'ROI_NDVI_1990',
  region: ROI,
  scale: 30,
  crs: EXPORT_CRS,
  format: 'GEO_TIFF'
}));

print('DOWNLOAD NDVI 2015:', ndvi2015.getDownloadURL({
  name: 'ROI_NDVI_2015',
  region: ROI,
  scale: 10,
  crs: EXPORT_CRS,
  format: 'GEO_TIFF'
}));

print('DOWNLOAD NDVI 2025:', ndvi2025.getDownloadURL({
  name: 'ROI_NDVI_2025',
  region: ROI,
  scale: 10,
  crs: EXPORT_CRS,
  format: 'GEO_TIFF'
}));

print('DOWNLOAD NDVI CHANGE (1990-2025):', ndviChange.getDownloadURL({
  name: 'ROI_NDVI_Change_1990_2025',
  region: ROI,
  scale: 30,
  crs: EXPORT_CRS,
  format: 'GEO_TIFF'
}));

// --- 5C. NDBI DOWNLOADS ---

print('DOWNLOAD NDBI 1990:', ndbi1990.getDownloadURL({
  name: 'ROI_NDBI_1990',
  region: ROI,
  scale: 30,
  crs: EXPORT_CRS,
  format: 'GEO_TIFF'
}));

print('DOWNLOAD NDBI 2015:', ndbi2015.getDownloadURL({
  name: 'ROI_NDBI_2015',
  region: ROI,
  scale: 10,
  crs: EXPORT_CRS,
  format: 'GEO_TIFF'
}));

print('DOWNLOAD NDBI 2025:', ndbi2025.getDownloadURL({
  name: 'ROI_NDBI_2025',
  region: ROI,
  scale: 10,
  crs: EXPORT_CRS,
  format: 'GEO_TIFF'
}));

print('DOWNLOAD NDBI CHANGE (1990-2025):', ndbiChange.getDownloadURL({
  name: 'ROI_NDBI_Change_1990_2025',
  region: ROI,
  scale: 30,
  crs: EXPORT_CRS,
  format: 'GEO_TIFF'
}));

// --- 5D. TRANSITION & CHANGE MASKS ---

print('DOWNLOAD SIGNIFICANT VEGETATION LOSS:', significantVegetationLoss.selfMask().toByte().getDownloadURL({
  name: 'ROI_Vegetation_Loss',
  region: ROI,
  scale: 30,
  crs: EXPORT_CRS,
  format: 'GEO_TIFF'
}));

print('DOWNLOAD SIGNIFICANT BUILT-UP INCREASE:', significantBuiltUpIncrease.selfMask().toByte().getDownloadURL({
  name: 'ROI_Builtup_Increase',
  region: ROI,
  scale: 30,
  crs: EXPORT_CRS,
  format: 'GEO_TIFF'
}));

print('DOWNLOAD POTENTIAL URBAN CONVERSION:', potentialUrbanConversion.selfMask().toByte().getDownloadURL({
  name: 'ROI_Potential_Urban_Conversion',
  region: ROI,
  scale: 30,
  crs: EXPORT_CRS,
  format: 'GEO_TIFF'
}));