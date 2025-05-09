// USAMOS ESTA PARA DEVOLVER TODA LA INFO DE LOS FOTÓGRAFOS 
import { User } from '../user.entity';

export class PhotographerWithRatingDto {
  user: User;
  averageRating: number;
}
