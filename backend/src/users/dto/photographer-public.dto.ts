import { Service } from '../../services/service.entity';
import { Location } from '../../locations/location.entity';

export class PhotographerPublicDto {
  id: number;
  name: string;
  email: string;
  phone_number?: string;
  registry_date: Date;
  active: boolean;
  role: string;
  description?: string;
  url_portfolio?: string;
  url_profile_image?: string;
  url_cover_image?: string;
  services: Service[];
  locations: Location[];
  averageRating: number;

  availability?: {
    day: number;
    slots: {
      start: string;
      end: string;
    }[];
  }[];
}
