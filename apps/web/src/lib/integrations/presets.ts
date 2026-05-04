export interface IntegrationPreset {
  name: string;
  url: string;
  type: IntegrationType;
  fieldMapping: Record<string, string>;
}

export const INTEGRATION_PRESETS: Record<string, IntegrationPreset> = {
  // 3D MODEL PRESETS
  POLY_PIZZA: {
    name: 'Poly Pizza',
    url: 'https://api.poly.pizza/v1.1/search',
    type: 'MODEL_3D',
    fieldMapping: {
      id: 'ID',
      name: 'Title',
      file: 'Download',
      thumbnail: 'Thumbnail',
      category: 'Category',
    },
  },

  //OAUTH PROBLEM TO GET THE GLB SO NO FOR NOW ON
  SKETCHFAB: {
    name: 'Sketchfab',
    url: 'https://api.sketchfab.com/v3/models',
    type: 'MODEL_3D',
    fieldMapping: {
      id: 'uid',
      name: 'name',
      file: 'archives.source.url',
      thumbnail: 'thumbnails.images.0.url',
      category: 'categories.0.name',
    },
  },

  //SOUND PRESETS
  FREESOUND: {
    name: 'Freesound',
    url: 'https://freesound.org/apiv2/search/text/',
    type: 'SOUND',
    fieldMapping: {
      id: 'id',
      name: 'name',
      file: 'previews.preview-hq-mp3',
      category: 'tags.0',
    },
  },
};
