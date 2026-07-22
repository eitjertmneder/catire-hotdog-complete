/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `branches` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[coordinates_long]` on the table `branches` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[coordinates_lat]` on the table `branches` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "branches_name_key" ON "branches"("name");

-- CreateIndex
CREATE UNIQUE INDEX "branches_coordinates_long_key" ON "branches"("coordinates_long");

-- CreateIndex
CREATE UNIQUE INDEX "branches_coordinates_lat_key" ON "branches"("coordinates_lat");
