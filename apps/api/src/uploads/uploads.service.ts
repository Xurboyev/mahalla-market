import { BadRequestException, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import {
  CreateBucketCommand,
  HeadBucketCommand,
  PutBucketPolicyCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

const ALLOWED_CONTENT_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB — client WebP'ga siqib yuboradi
const PRESIGN_EXPIRES_SECONDS = 300;

@Injectable()
export class UploadsService implements OnModuleInit {
  private log = new Logger(UploadsService.name);
  private bucket = process.env.S3_BUCKET ?? "mahalla";
  private publicBase = (process.env.S3_PUBLIC_URL ?? process.env.S3_ENDPOINT ?? "http://localhost:9100").replace(
    /\/$/,
    "",
  );

  private s3 = new S3Client({
    endpoint: process.env.S3_ENDPOINT ?? "http://localhost:9100",
    region: "us-east-1",
    forcePathStyle: true, // MinIO uchun majburiy
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY ?? "minio",
      secretAccessKey: process.env.S3_SECRET_KEY ?? "minio12345",
    },
  });

  /** Ilova ishga tushganda bucket mavjudligini tekshiradi, bo'lmasa yaratadi va public-read qiladi. */
  async onModuleInit() {
    try {
      await this.s3.send(new HeadBucketCommand({ Bucket: this.bucket }));
    } catch {
      try {
        await this.s3.send(new CreateBucketCommand({ Bucket: this.bucket }));
        await this.s3.send(
          new PutBucketPolicyCommand({
            Bucket: this.bucket,
            Policy: JSON.stringify({
              Version: "2012-10-17",
              Statement: [
                {
                  Effect: "Allow",
                  Principal: "*",
                  Action: "s3:GetObject",
                  Resource: `arn:aws:s3:::${this.bucket}/*`,
                },
              ],
            }),
          }),
        );
        this.log.log(`Bucket '${this.bucket}' yaratildi (public-read)`);
      } catch (e) {
        this.log.warn(`Bucket tayyorlashda xatolik (MinIO ishga tushmagan bo'lishi mumkin): ${e}`);
      }
    }
  }

  /** Rasm yuklash uchun presigned PUT URL + keyingi POST /listings'da ishlatiladigan public URL. */
  async createPresignedUpload(userId: string, contentType: string) {
    const ext = ALLOWED_CONTENT_TYPES[contentType];
    if (!ext) throw new BadRequestException("Faqat JPEG/PNG/WebP rasm qabul qilinadi");
    const key = `listings/${userId}/${Date.now()}-${randomUUID()}.${ext}`;
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
      ContentLength: undefined, // klient yuklashda header orqali beradi, serverda tekshirmaymiz (MVP)
    });
    const uploadUrl = await getSignedUrl(this.s3, command, { expiresIn: PRESIGN_EXPIRES_SECONDS });
    return {
      uploadUrl,
      publicUrl: `${this.publicBase}/${this.bucket}/${key}`,
      key,
      maxBytes: MAX_UPLOAD_BYTES,
      expiresIn: PRESIGN_EXPIRES_SECONDS,
    };
  }
}
