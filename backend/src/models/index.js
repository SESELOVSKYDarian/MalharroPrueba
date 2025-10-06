import sequelize from '../config/database.js';
import Role from './Role.js';
import User from './User.js';
import Media from './Media.js';
import ImageAsset from './ImageAsset.js';
import TextBlock from './TextBlock.js';
import Slider from './Slider.js';
import Slide from './Slide.js';
import AgendaItem from './AgendaItem.js';
import Usina from './Usina.js';
import Document from './Document.js';
import Accordion from './Accordion.js';
import AccordionItem from './AccordionItem.js';

const models = {
  Role,
  User,
  Media,
  ImageAsset,
  TextBlock,
  Slider,
  Slide,
  AgendaItem,
  Usina,
  Document,
  Accordion,
  AccordionItem,
};

export default models;
export { sequelize };
