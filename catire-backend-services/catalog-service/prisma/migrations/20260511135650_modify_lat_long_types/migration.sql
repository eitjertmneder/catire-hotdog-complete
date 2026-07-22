/*
  Warnings:

  - Changed the type of `coordinates_long` on the `branches` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `coordinates_lat` on the `branches` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "branches" DROP COLUMN "coordinates_long",
ADD COLUMN     "coordinates_long" INTEGER NOT NULL,
DROP COLUMN "coordinates_lat",
ADD COLUMN     "coordinates_lat" INTEGER NOT NULL;
