-- ============================================================
-- AUTOHUB - DATABASE SCHEMA (volledige versie)
-- Importeer dit bestand in phpMyAdmin (MAMP).
-- ============================================================

CREATE DATABASE IF NOT EXISTS autohub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE autohub;

-- Bestaande tabellen verwijderen (schone herinstallatie)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS proefritten;
DROP TABLE IF EXISTS auto_fotos;
DROP TABLE IF EXISTS favorieten;
DROP TABLE IF EXISTS tuning_opties;
DROP TABLE IF EXISTS contactberichten;
DROP TABLE IF EXISTS autos;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- ------------------------------------------------------------
-- users
-- ------------------------------------------------------------
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  naam VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  wachtwoord_hash VARCHAR(255) NOT NULL,
  rol ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  aangemaakt_op DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- autos
-- ------------------------------------------------------------
CREATE TABLE autos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  merk VARCHAR(60) NOT NULL,
  model VARCHAR(80) NOT NULL,
  bouwjaar INT NOT NULL,
  prijs DECIMAL(10,2) NOT NULL,
  vermogen_pk INT NOT NULL,
  brandstof ENUM('Benzine', 'Diesel', 'Elektrisch', 'Hybride') NOT NULL,
  transmissie ENUM('Handgeschakeld', 'Automaat') NOT NULL DEFAULT 'Handgeschakeld',
  kilometerstand INT NOT NULL DEFAULT 0,
  kleur VARCHAR(50) DEFAULT NULL,
  omschrijving TEXT,
  afbeelding_url VARCHAR(500) DEFAULT '/img/auto-placeholder.svg',
  is_nieuw TINYINT(1) DEFAULT 0,
  is_populair TINYINT(1) DEFAULT 0,
  aangemaakt_op DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- auto_fotos (meerdere foto's per auto - galerij)
-- ------------------------------------------------------------
CREATE TABLE auto_fotos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  auto_id INT NOT NULL,
  foto_url VARCHAR(500) NOT NULL,
  volgorde INT DEFAULT 0,
  FOREIGN KEY (auto_id) REFERENCES autos(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- tuning_opties
-- ------------------------------------------------------------
CREATE TABLE tuning_opties (
  id INT AUTO_INCREMENT PRIMARY KEY,
  auto_id INT NOT NULL,
  naam VARCHAR(100) NOT NULL,
  prijs_extra DECIMAL(8,2) NOT NULL,
  FOREIGN KEY (auto_id) REFERENCES autos(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- favorieten
-- ------------------------------------------------------------
CREATE TABLE favorieten (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  auto_id INT NOT NULL,
  toegevoegd_op DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (auto_id) REFERENCES autos(id) ON DELETE CASCADE,
  UNIQUE KEY unieke_favoriet (user_id, auto_id)
);

-- ------------------------------------------------------------
-- reviews (beoordelingen per auto)
-- ------------------------------------------------------------
CREATE TABLE reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  auto_id INT NOT NULL,
  user_id INT NOT NULL,
  sterren INT NOT NULL,
  titel VARCHAR(120) NOT NULL,
  tekst TEXT NOT NULL,
  geplaatst_op DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (auto_id) REFERENCES autos(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- proefritten (proefrit-aanvragen)
-- ------------------------------------------------------------
CREATE TABLE proefritten (
  id INT AUTO_INCREMENT PRIMARY KEY,
  auto_id INT NOT NULL,
  naam VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  telefoon VARCHAR(30) DEFAULT NULL,
  gewenste_datum DATE NOT NULL,
  opmerking TEXT,
  status ENUM('aangevraagd', 'bevestigd', 'afgerond', 'geannuleerd') DEFAULT 'aangevraagd',
  aangevraagd_op DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (auto_id) REFERENCES autos(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- contactberichten
-- ------------------------------------------------------------
CREATE TABLE contactberichten (
  id INT AUTO_INCREMENT PRIMARY KEY,
  naam VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  telefoon VARCHAR(30) DEFAULT NULL,
  onderwerp VARCHAR(100) NOT NULL,
  bericht TEXT NOT NULL,
  verzonden_op DATETIME DEFAULT CURRENT_TIMESTAMP,
  gelezen TINYINT(1) DEFAULT 0
);
