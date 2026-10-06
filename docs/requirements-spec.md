Skillz Directory

(Community Skills & Services Directory)

Software Requirements Specification

Version 1.0
24th September 2026

Phalira Grace Christina
Group Leader / Lead Software Engineer
Group FF8 – Department of Computing

Document Approval
The following Software Requirements Specification has been accepted and
approved by the following:
Title Name Date
Course Instructor Isaac S. Mwakabira
Supervisor Ken Junior Kandoje
Group Leader Phalira Grace Christina

Table of Contents
1. Introduction.......................................................................................................4
1.1 Purpose.......................................................................................................4
1.2 Scope..........................................................................................................4
1.3 Definitions, Acronyms, and Abbreviations...............................................4
1.4 Overview....................................................................................................5
2. General Description ..........................................................................................5
2.1 Product Functions......................................................................................5
2.2 User Characteristics/Roles.........................................................................5
2.3 External Interface Requirements ...............................................................5
2.4 Functional Requirements...........................................................................5
2.5 Use Cases...................................................................................................6
2.5.1 Use Case #1 – Resident Searches for a Service Provider..................6
2.5.2 Use Case #2 – Provider Registers and Lists a Service ......................7
2.6 Non-Functional Requirements...................................................................7
3. System Architecture..........................................................................................8
4. General Constraints...........................................................................................8
4.3 References..................................................................................................8

Skillz Directory – Software Requirements Specification

Page 4 of 11

1. Introduction
This document defines the software requirements for Skillz Directory, a web-based
Community Skills & Services Directory being developed by Group FF8 as part of
the Software Engineering group mini-project. It provides all of the information
needed by the development team to design and implement the frontend of the
software product described herein.
1.1 Purpose
The purpose of this Software Requirements Specification (SRS) is to clearly and
completely describe the functional and non-functional requirements of the Skillz
Directory platform. It is intended for use by the development team, the course
instructor, the supervisor, and any other stakeholder who needs to understand what
the system is required to do before implementation and presentation of the project.
1.2 Scope
The software product to be produced is Skillz Directory, a web-based local
services directory and discovery platform. The system will allow service providers
(such as plumbers, electricians, mechanics, and other tradespeople) to register and
list the services they offer, and will allow residents to search for, discover, and
evaluate providers near them, view ratings and reviews left by previous customers,
and contact providers directly.
The system will not itself verify the professional qualifications or licensing of
providers; reputation is instead built through resident ratings and reviews. The
initial version of the platform is scoped to operate within a single city, with
expansion to additional locations considered a future goal beyond the current
project.
This SRS is consistent with, and elaborates on, the problem statement and
objective set out in the Group FF8 project brief issued by the Department of
Computing.
1.3 Definitions, Acronyms, and Abbreviations
Term Definition

Skillz Directory – Software Requirements Specification

Page 5 of 11

Resident A user of the platform seeking to find, evaluate, and

contact a local service provider.

Provider A tradesperson or small local business that registers on

the platform to list and offer services.

Listing A published record created by a provider describing a

specific service they offer.

SRS Software Requirements Specification.
FR Functional Requirement.
NFR Non-Functional Requirement.
UI User Interface.
1.4 Overview
The remainder of this SRS is organized as follows. Section 2 provides a general
description of the product, its intended users, its functions, and its interface,
functional, and non-functional requirements, along with representative use cases.
Section 3 outlines the intended system architecture. Section 4 describes general
constraints on the project and lists references used in preparing this document.
2. General Description
This section describes the general factors that affect the product and its
requirements. It does not itself state specific requirements, but provides context
that makes the requirements in Section 2.4 and 2.6 easier to understand.
2.1 Product Functions
At a summary level, Skillz Directory will allow the system to:
• Allow service providers to register, log in, and manage listings describing the
services they offer.
• Allow residents to register, log in, and search for service providers by
category, keyword, or proximity.
• Allow residents to view provider profiles, including their ratings and past
reviews.

Skillz Directory – Software Requirements Specification

Page 6 of 11

• Allow residents who have used a provider's services to submit a rating and
written review.
• Allow residents to contact providers directly to request or discuss a service.
2.2 User Characteristics/Roles
The system is intended for two primary categories of user, both of whom may have
limited or varied levels of technical experience and should therefore be supported
by a simple, intuitive interface:
• Resident – A member of the community who searches for, evaluates, and
contacts local service providers.
• Service Provider – An independent tradesperson or small local business that
registers on the platform to advertise and manage the services they offer.
2.3 External Interface Requirements
The system shall provide a web-based graphical user interface accessible through a
standard modern web browser, requiring no additional software installation by the

user. The interface shall be responsive and usable on both desktop and mobile-
sized screens. No specialised hardware interfaces are required.

2.4 Functional Requirements
This section describes the specific features the system must provide. Each
requirement is identified by a unique ID and assigned a priority reflecting its
importance to the core purpose of the platform.
ID Requirement Description Priority

FR-01

Provider Profile
creation (Registration
& Login )

The system shall allow a service
provider to create an account,
register a business/personal profile
(including name, contact details,
and service category), and log in to
access their profile and listings.

High

FR-02 Service Listing
Management

The system shall allow a registered
provider to create, edit, and
remove listings describing the
services they offer.

High

Skillz Directory – Software Requirements Specification

Page 7 of 11

FR-03 Resident Registration

& Login

The system shall allow residents to
register an account and log in to
access search, review, and
messaging features.

High

FR-04 Search Providers

The system shall allow users to
search for service providers by
service type/category and
keyword.

High

FR-05 Location-Based
Discovery

The system shall allow users to
find and filter service providers
based on proximity to a specified
location.

High

FR-06 View Provider Profile

The system shall display a
provider's full profile, including
services offered, contact
information, and reputation details.
High

FR-07 Ratings & Reviews

The system shall allow residents
who have used a provider's service
to submit a rating and written
review.

High

FR-08 View Ratings &
Reviews

The system shall display
aggregated ratings and past
reviews on each provider's profile
for other users to view.

High

FR-09 Direct

Contact/Messaging

The system shall provide a means
for residents to contact a provider
directly (e.g. via in-app message,
phone, or email link).

Medium

FR-10 Profile Management

The system shall allow both
residents and providers to view
and update their own
account/profile information.

Medium

FR-11 Category Browsing

The system shall allow users to
browse available service
categories (e.g. plumbing,

Medium

Skillz Directory – Software Requirements Specification

Page 8 of 11
electrical, mechanical) without
needing to search by keyword.

FR-12 Authentication &
Access Control

The system shall restrict listing-
management actions to the

authenticated provider who owns
the listing.

High

2.5 Use Cases
2.5.1 Use Case #1 – Resident Searches for a Service Provider
Actor: Resident.
Description: A resident wants to find a service provider near them for a specific
need.
• The resident logs in to their account (FR-03).
• The resident enters a service category or keyword, and optionally a location,
into the search feature (FR-04, FR-05).
• The system returns a list of matching providers, including their ratings.
• The resident selects a provider to view their full profile, including reviews
(FR-06, FR-08).
• The resident contacts the provider directly through the platform (FR-09).
2.5.2 Use Case #2 – Provider Registers and Lists a Service
Actor: Service Provider.
Description: A tradesperson wants to make their services discoverable to residents.
• The provider creates an account and registers their profile (FR-01).
• The provider logs in to their account (FR-01).
• The provider creates a new listing describing a service they offer (FR-02).
• The listing becomes visible to residents through search and category browsing
(FR-04, FR-11).
• The provider may edit or remove the listing at any time (FR-02, FR-12).
2.6 Non-Functional Requirements

Skillz Directory – Software Requirements Specification

Page 9 of 11

Non-functional requirements describe the quality attributes the system must exhibit
in delivering the functionality above, rather than specific features in themselves.
ID Requirement Description Priority

NFR-01 Usability

The interface shall be
simple and intuitive enough
for residents and providers
with limited technical
experience to use without
training.

High

NFR-02 Responsiveness

The web application shall
render correctly and remain
usable on both desktop and
mobile-sized screens.

High

NFR-03 Performance

Search results shall be
returned to the user within
an acceptable response time
under normal load.

Medium

NFR-04 Reliability/Availability

The platform shall be
available for use with
minimal downtime during
the project demonstration
and operating periods.

Medium

NFR-05 Security

User passwords and
personal data shall be stored
and transmitted securely,
and access to accounts shall
require authentication.

High

NFR-06 Data Integrity

The system shall ensure that
reviews can only be
submitted by authenticated
users and are accurately
attributed and stored.

High

NFR-07 Scalability

The system architecture
shall support future growth
in the number of users and
Low

Skillz Directory – Software Requirements Specification

Page 10 of 11
service listings without
major redesign.

NFR-08 Maintainability

The codebase shall be
structured and documented
so that it can be understood,
modified, and extended by
other developers.

Medium

NFR-09 Trustworthiness/Transparency

The system shall present
provider ratings and reviews
transparently to support
informed decisions by
residents.

Medium

NFR-10 Compatibility

The web application shall
function correctly on
current versions of major
web browsers.

Medium

3. System Architecture
Skillz Directory will be developed following a standard client-server web

architecture. The frontend, covered by this SRS, will be implemented as a web-
based client responsible for presenting the user interface and handling user

interaction, including search, listing management, and review submission. The
frontend will communicate with a backend service (covered separately) responsible
for authentication, data storage, and business logic, via a defined API. Data such as
user accounts, provider listings, and reviews will be persisted in a central database
accessible to the backend.

4. General Constraints
The following general constraints apply to the design and development of the
system:
• The initial version of the platform is limited in geographic scope to a single
city.
• Development must follow the timeline and milestones set out in the Group FF8
project specification, with the final product presented by 20th November 2026.

Skillz Directory – Software Requirements Specification

Page 11 of 11
