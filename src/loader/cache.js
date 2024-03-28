const modelCache = {
  rooms: {},
  items: {},
  characters: {},
  animations: {},
};

function addToCache(type, modelName, model) {
  switch (type) {
    case "room":
      modelCache.rooms[modelName] = model;
      break;
    case "item":
      modelCache.items[modelName] = model;
      break;
    case "character":
      modelCache.characters[modelName] = model;
      break;
    case "animation":
      modelCache.animations[modelName] = model;
      break;
  }
}

function getFromCache(type, modelName) {
  let resultFromCache = null;
  switch (type) {
    case "room":
      resultFromCache = modelCache.rooms[modelName];
      break;
    case "item":
      resultFromCache = modelCache.items[modelName];
      break;
    case "character":
      resultFromCache = modelCache.characters[modelName];
      break;
    case "animation":
      resultFromCache = modelCache.animations[modelName];
      break;
  }
  return resultFromCache;
}

export { addToCache, getFromCache };
