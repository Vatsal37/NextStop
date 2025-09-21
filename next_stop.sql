-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Sep 21, 2025 at 03:12 PM
-- Server version: 9.1.0
-- PHP Version: 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `next_stop`
--

-- --------------------------------------------------------

--
-- Table structure for table `aircraft`
--

DROP TABLE IF EXISTS `aircraft`;
CREATE TABLE IF NOT EXISTS `aircraft` (
  `aircraft_id` int NOT NULL AUTO_INCREMENT,
  `airline_id` int NOT NULL,
  `aircraft_model` varchar(100) NOT NULL,
  `registration_number` varchar(50) NOT NULL,
  `manufacturer` varchar(100) DEFAULT NULL,
  `total_seats` int NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`aircraft_id`),
  UNIQUE KEY `registration_number` (`registration_number`),
  KEY `idx_aircraft_airline` (`airline_id`),
  KEY `idx_aircraft_reg` (`registration_number`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `airlines`
--

DROP TABLE IF EXISTS `airlines`;
CREATE TABLE IF NOT EXISTS `airlines` (
  `airline_id` int NOT NULL AUTO_INCREMENT,
  `airline_code` varchar(10) NOT NULL,
  `airline_name` varchar(191) NOT NULL,
  `country` varchar(100) NOT NULL,
  `contact_info` text,
  `website` varchar(191) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`airline_id`),
  UNIQUE KEY `airline_code` (`airline_code`),
  KEY `idx_airlines_code` (`airline_code`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `airports`
--

DROP TABLE IF EXISTS `airports`;
CREATE TABLE IF NOT EXISTS `airports` (
  `airport_id` int NOT NULL AUTO_INCREMENT,
  `airport_code` varchar(10) NOT NULL,
  `airport_name` varchar(191) NOT NULL,
  `city` varchar(100) NOT NULL,
  `country` varchar(100) NOT NULL,
  `timezone` varchar(50) NOT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`airport_id`),
  UNIQUE KEY `airport_code` (`airport_code`),
  KEY `idx_airports_code` (`airport_code`),
  KEY `idx_airports_city` (`city`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
CREATE TABLE IF NOT EXISTS `bookings` (
  `booking_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `pnr` varchar(10) NOT NULL,
  `booking_status` enum('PENDING','CONFIRMED','CANCELLED','COMPLETED') DEFAULT 'PENDING',
  `total_passengers` int NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `currency` varchar(5) DEFAULT 'USD',
  `booking_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `expiry_time` timestamp NULL DEFAULT NULL,
  `contact_email` varchar(191) NOT NULL,
  `contact_phone` varchar(20) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`booking_id`),
  UNIQUE KEY `pnr` (`pnr`),
  KEY `idx_bookings_user` (`user_id`),
  KEY `idx_bookings_pnr` (`pnr`),
  KEY `idx_bookings_status` (`booking_status`),
  KEY `idx_bookings_date` (`booking_date`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cancellations`
--

DROP TABLE IF EXISTS `cancellations`;
CREATE TABLE IF NOT EXISTS `cancellations` (
  `cancellation_id` int NOT NULL AUTO_INCREMENT,
  `ticket_id` int NOT NULL,
  `requested_by` int NOT NULL,
  `cancellation_reason` text,
  `cancellation_status` enum('PENDING','APPROVED','REJECTED','PROCESSED') DEFAULT 'PENDING',
  `cancellation_fee` decimal(10,2) DEFAULT '0.00',
  `refund_eligible_amount` decimal(10,2) DEFAULT NULL,
  `processed_by` int DEFAULT NULL,
  `admin_notes` text,
  `processed_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`cancellation_id`),
  KEY `idx_cancellations_ticket` (`ticket_id`),
  KEY `idx_cancellations_requester` (`requested_by`),
  KEY `idx_cancellations_status` (`cancellation_status`),
  KEY `idx_cancellations_processed_by` (`processed_by`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `fares`
--

DROP TABLE IF EXISTS `fares`;
CREATE TABLE IF NOT EXISTS `fares` (
  `fare_id` int NOT NULL AUTO_INCREMENT,
  `schedule_id` int NOT NULL,
  `class_id` int NOT NULL,
  `base_price` decimal(10,2) NOT NULL,
  `tax_amount` decimal(10,2) DEFAULT '0.00',
  `total_price` decimal(10,2) GENERATED ALWAYS AS ((`base_price` + `tax_amount`)) STORED,
  `currency` varchar(5) DEFAULT 'USD',
  `valid_from` date NOT NULL,
  `valid_until` date NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`fare_id`),
  UNIQUE KEY `unique_fare` (`schedule_id`,`class_id`,`valid_from`),
  KEY `idx_fares_schedule` (`schedule_id`),
  KEY `idx_fares_class` (`class_id`),
  KEY `idx_fares_valid_dates` (`valid_from`,`valid_until`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `flight_instances`
--

DROP TABLE IF EXISTS `flight_instances`;
CREATE TABLE IF NOT EXISTS `flight_instances` (
  `instance_id` int NOT NULL AUTO_INCREMENT,
  `schedule_id` int NOT NULL,
  `flight_date` date NOT NULL,
  `actual_departure` datetime DEFAULT NULL,
  `actual_arrival` datetime DEFAULT NULL,
  `status` enum('SCHEDULED','BOARDING','DEPARTED','ARRIVED','DELAYED','CANCELLED') DEFAULT 'SCHEDULED',
  `gate_number` varchar(10) DEFAULT NULL,
  `delay_minutes` int DEFAULT '0',
  `cancellation_reason` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`instance_id`),
  UNIQUE KEY `unique_flight_instance` (`schedule_id`,`flight_date`),
  KEY `idx_instances_schedule` (`schedule_id`),
  KEY `idx_instances_date` (`flight_date`),
  KEY `idx_instances_schedule_date` (`schedule_id`,`flight_date`),
  KEY `idx_instances_status` (`status`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `flight_routes`
--

DROP TABLE IF EXISTS `flight_routes`;
CREATE TABLE IF NOT EXISTS `flight_routes` (
  `route_id` int NOT NULL AUTO_INCREMENT,
  `source_airport_id` int NOT NULL,
  `destination_airport_id` int NOT NULL,
  `distance_km` decimal(10,2) NOT NULL,
  `estimated_duration_minutes` int NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`route_id`),
  KEY `idx_routes_source` (`source_airport_id`),
  KEY `idx_routes_destination` (`destination_airport_id`),
  KEY `idx_routes_source_dest` (`source_airport_id`,`destination_airport_id`)
) ;

-- --------------------------------------------------------

--
-- Table structure for table `flight_schedules`
--

DROP TABLE IF EXISTS `flight_schedules`;
CREATE TABLE IF NOT EXISTS `flight_schedules` (
  `schedule_id` int NOT NULL AUTO_INCREMENT,
  `airline_id` int NOT NULL,
  `route_id` int NOT NULL,
  `aircraft_id` int NOT NULL,
  `flight_number` varchar(20) NOT NULL,
  `departure_time` time NOT NULL,
  `arrival_time` time NOT NULL,
  `frequency` enum('DAILY','WEEKLY_MON','WEEKLY_TUE','WEEKLY_WED','WEEKLY_THU','WEEKLY_FRI','WEEKLY_SAT','WEEKLY_SUN') NOT NULL,
  `valid_from` date NOT NULL,
  `valid_until` date NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`schedule_id`),
  UNIQUE KEY `unique_flight_schedule` (`airline_id`,`flight_number`,`valid_from`),
  KEY `idx_schedules_airline` (`airline_id`),
  KEY `idx_schedules_route` (`route_id`),
  KEY `idx_schedules_aircraft` (`aircraft_id`),
  KEY `idx_schedules_flight_number` (`flight_number`),
  KEY `idx_schedules_valid_dates` (`valid_from`,`valid_until`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `passengers`
--

DROP TABLE IF EXISTS `passengers`;
CREATE TABLE IF NOT EXISTS `passengers` (
  `passenger_id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `passport_number` varchar(50) DEFAULT NULL,
  `date_of_birth` date NOT NULL,
  `gender` enum('Male','Female','Other') NOT NULL,
  `nationality` varchar(50) NOT NULL,
  `email` varchar(191) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`passenger_id`),
  UNIQUE KEY `passport_number` (`passport_number`),
  KEY `idx_passengers_passport` (`passport_number`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
CREATE TABLE IF NOT EXISTS `payments` (
  `payment_id` int NOT NULL AUTO_INCREMENT,
  `booking_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(5) DEFAULT 'USD',
  `payment_method` enum('CREDIT_CARD','DEBIT_CARD','UPI','NET_BANKING','WALLET','CASH') NOT NULL,
  `payment_status` enum('PENDING','COMPLETED','FAILED','REFUNDED','PARTIALLY_REFUNDED') DEFAULT 'PENDING',
  `transaction_id` varchar(100) DEFAULT NULL,
  `payment_gateway` varchar(50) DEFAULT NULL,
  `gateway_response` text,
  `failure_reason` text,
  `payment_date` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`payment_id`),
  UNIQUE KEY `transaction_id` (`transaction_id`),
  KEY `idx_payments_booking` (`booking_id`),
  KEY `idx_payments_status` (`payment_status`),
  KEY `idx_payments_transaction` (`transaction_id`),
  KEY `idx_payments_date` (`payment_date`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `refunds`
--

DROP TABLE IF EXISTS `refunds`;
CREATE TABLE IF NOT EXISTS `refunds` (
  `refund_id` int NOT NULL AUTO_INCREMENT,
  `cancellation_id` int NOT NULL,
  `payment_id` int NOT NULL,
  `refund_amount` decimal(10,2) NOT NULL,
  `refund_method` enum('ORIGINAL_PAYMENT_METHOD','BANK_TRANSFER','WALLET','CHEQUE') DEFAULT 'ORIGINAL_PAYMENT_METHOD',
  `refund_status` enum('PENDING','PROCESSED','FAILED','COMPLETED') DEFAULT 'PENDING',
  `refund_transaction_id` varchar(100) DEFAULT NULL,
  `gateway_response` text,
  `processed_by` int DEFAULT NULL,
  `processing_fee` decimal(10,2) DEFAULT '0.00',
  `net_refund_amount` decimal(10,2) GENERATED ALWAYS AS ((`refund_amount` - `processing_fee`)) STORED,
  `processed_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`refund_id`),
  KEY `idx_refunds_cancellation` (`cancellation_id`),
  KEY `idx_refunds_payment` (`payment_id`),
  KEY `idx_refunds_status` (`refund_status`),
  KEY `idx_refunds_processed_by` (`processed_by`),
  KEY `idx_refunds_transaction` (`refund_transaction_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `seats`
--

DROP TABLE IF EXISTS `seats`;
CREATE TABLE IF NOT EXISTS `seats` (
  `seat_id` int NOT NULL AUTO_INCREMENT,
  `aircraft_id` int NOT NULL,
  `class_id` int NOT NULL,
  `seat_number` varchar(10) NOT NULL,
  `seat_row` int NOT NULL,
  `seat_column` varchar(2) NOT NULL,
  `is_window` tinyint(1) DEFAULT '0',
  `is_aisle` tinyint(1) DEFAULT '0',
  `is_middle` tinyint(1) DEFAULT '0',
  `is_emergency_exit` tinyint(1) DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`seat_id`),
  UNIQUE KEY `unique_seat` (`aircraft_id`,`seat_number`),
  KEY `idx_seats_aircraft` (`aircraft_id`),
  KEY `idx_seats_class` (`class_id`),
  KEY `idx_seats_number` (`seat_number`),
  KEY `idx_seats_row` (`seat_row`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `seat_classes`
--

DROP TABLE IF EXISTS `seat_classes`;
CREATE TABLE IF NOT EXISTS `seat_classes` (
  `class_id` int NOT NULL AUTO_INCREMENT,
  `class_name` varchar(50) NOT NULL,
  `class_code` varchar(5) NOT NULL,
  `baggage_allowance_kg` int DEFAULT '20',
  `meal_service` tinyint(1) DEFAULT '0',
  `priority_boarding` tinyint(1) DEFAULT '0',
  `seat_pitch_inches` int DEFAULT NULL,
  `extra_legroom` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`class_id`),
  KEY `idx_seatclass_code` (`class_code`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `seat_classes`
--

INSERT INTO `seat_classes` (`class_id`, `class_name`, `class_code`, `baggage_allowance_kg`, `meal_service`, `priority_boarding`, `seat_pitch_inches`, `extra_legroom`, `created_at`) VALUES
(1, 'Economy', 'Y', 20, 0, 0, 30, 0, '2025-09-19 18:09:55'),
(2, 'Premium Economy', 'W', 25, 1, 0, 34, 1, '2025-09-19 18:09:55'),
(3, 'Business', 'J', 35, 1, 1, 42, 1, '2025-09-19 18:09:55'),
(4, 'First Class', 'F', 50, 1, 1, 60, 1, '2025-09-19 18:09:55');

-- --------------------------------------------------------

--
-- Table structure for table `tickets`
--

DROP TABLE IF EXISTS `tickets`;
CREATE TABLE IF NOT EXISTS `tickets` (
  `ticket_id` int NOT NULL AUTO_INCREMENT,
  `booking_id` int NOT NULL,
  `passenger_id` int NOT NULL,
  `instance_id` int NOT NULL,
  `seat_id` int NOT NULL,
  `ticket_number` varchar(20) NOT NULL,
  `ticket_status` enum('CONFIRMED','CANCELLED','CHECKED_IN','BOARDED','NO_SHOW') DEFAULT 'CONFIRMED',
  `fare_amount` decimal(10,2) NOT NULL,
  `tax_amount` decimal(10,2) DEFAULT '0.00',
  `total_amount` decimal(10,2) GENERATED ALWAYS AS ((`fare_amount` + `tax_amount`)) STORED,
  `baggage_allowance_kg` int DEFAULT NULL,
  `check_in_time` datetime DEFAULT NULL,
  `boarding_time` datetime DEFAULT NULL,
  `issued_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ticket_id`),
  UNIQUE KEY `ticket_number` (`ticket_number`),
  UNIQUE KEY `unique_seat_booking` (`instance_id`,`seat_id`),
  KEY `idx_tickets_booking` (`booking_id`),
  KEY `idx_tickets_passenger` (`passenger_id`),
  KEY `idx_tickets_instance` (`instance_id`),
  KEY `idx_tickets_seat` (`seat_id`),
  KEY `idx_tickets_number` (`ticket_number`),
  KEY `idx_tickets_status` (`ticket_status`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(191) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('Male','Female','Other') DEFAULT NULL,
  `nationality` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_users_email` (`email`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
