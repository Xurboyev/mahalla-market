import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { CategoriesController } from "./categories/categories.controller";
import { ChatModule } from "./chat/chat.module";
import { DbModule } from "./db/db.module";
import { HealthController } from "./health/health.controller";
import { ListingsModule } from "./listings/listings.module";
import { RegionsController } from "./regions/regions.controller";
import { ReportsModule } from "./reports/reports.module";
import { ReviewsModule } from "./reviews/reviews.module";
import { UploadsModule } from "./uploads/uploads.module";

@Module({
  imports: [DbModule, AuthModule, ListingsModule, UploadsModule, ChatModule, ReviewsModule, ReportsModule],
  controllers: [HealthController, RegionsController, CategoriesController],
})
export class AppModule {}
