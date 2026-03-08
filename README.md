# Meetings API Documentation

This document provides detailed information about the Meetings API endpoints, including payloads, responses, and validation rules.

**Base Path:** `/api/meetings`

**Authentication:** All endpoints require a valid user authentication token to be sent in the request headers.

---

## 1. Add a New Meeting

Creates a new meeting record.

*   **Endpoint:** `POST /`
*   **Description:** Creates a new single or recurring meeting.
*   **Permissions:** Any authenticated user can create a meeting.

### Request Body

| Field          | Type           | Required | Description                                                                                                                                                             |
| :------------- | :------------- | :------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `recurrence`   | `string`       | Yes      | The recurrence rule for the meeting. See **Recurrence Rules** section below. Must be one of: `once`, `daily`, `weekly`, `monthly`, `quarterly`, `half-yearly`, `yearly`. |
| `date`         | `string`       | Yes      | The date and time of the meeting. The format depends on the `recurrence` value. See **Recurrence Rules** section.                                                        |
| `title`        | `string`       | Yes      | The title or subject of the meeting.                                                                                                                                    |
| `message`      | `string`       | Yes      | A detailed description or agenda for the meeting.                                                                                                                       |
| `attendees`    | `array`        | No       | An array of integer User IDs for those invited to the meeting. Example: `[5, 12, 23]`                                                                                    |
| `branch_id`    | `integer`      | No       | The ID of the branch associated with this meeting.                                                                                                                      |

### Sample Payload

```json
{
  "recurrence": "weekly",
  "date": "2-14:30",
  "title": "Weekly Team Sync",
  "message": "Discuss project progress and blockers.",
  "attendees": [1, 5, 8],
  "branch_id": 101
}
```

### Responses

*   **201 Created (Success)**
    ```json
    {
      "status": "true",
      "data": {
        "id": 1,
        "recurrence": "weekly",
        "date": "2-14:30",
        "title": "Weekly Team Sync",
        "message": "Discuss project progress and blockers.",
        "attendees": [1, 5, 8],
        "created_by": 1,
        "updated_by": 1,
        "branch_id": 101,
        "created_at": "2024-08-01T10:00:00.000Z",
        "updated_at": "2024-08-01T10:00:00.000Z"
      }
    }
    ```
*   **400 Bad Request (Error)**
    ```json
    {
      "status": "false",
      "message": "Invalid date format for the selected recurrence."
    }
    ```

---

## 2. Get Your Meetings

Retrieves meetings created by the user or where the user is an attendee.

*   **Endpoint:** `GET /`
*   **Description:** Retrieves a list of meetings relevant to the logged-in user. Can be filtered by `branch_id`.

### Query Parameters

| Field       | Type      | Required | Description                                  |
| :---------- | :-------- | :------- | :------------------------------------------- |
| `branch_id` | `integer` | No       | If provided, filters meetings by this branch. |

### Sample Request

`GET /api/meetings?branch_id=101`

### Responses

*   **200 OK (Success)**
    ```json
    {
      "status": "true",
      "data": [
        {
          "id": 1,
          "recurrence": "weekly",
          "date": "2-14:30",
          "title": "Weekly Team Sync",
          "message": "Discuss project progress and blockers.",
          "attendees": [1, 5, 8],
          "created_by": 1,
          "updated_by": 1,
          "branch_id": 101,
          "created_at": "2024-08-01T10:00:00.000Z",
          "updated_at": "2024-08-01T10:00:00.000Z"
        }
      ]
    }
    ```
*   **500 Internal Server Error**
    ```json
    {
      "status": "false",
      "message": "Error message details."
    }
    ```

---

## 3. Update a Meeting

Updates an existing meeting.

*   **Endpoint:** `PUT /:id`
*   **Description:** Updates the details of a specific meeting.
*   **Permissions:** Only the user who created the meeting can update it.

### Request Body

The request body is the same as the `POST /` endpoint. You only need to provide the fields you wish to update.

### Sample Payload

```json
{
  "title": "Updated: Weekly Team Sync",
  "attendees": [1, 5, 8, 12]
}
```

### Responses

*   **200 OK (Success)**
    ```json
    {
      "status": "true",
      "data": {
        "id": 1,
        "recurrence": "weekly",
        "date": "2-14:30",
        "title": "Updated: Weekly Team Sync",
        "message": "Discuss project progress and blockers.",
        "attendees": [1, 5, 8, 12],
        "created_by": 1,
        "updated_by": 1, // ID of user who made the update
        "branch_id": 101,
        "created_at": "2024-08-01T10:00:00.000Z",
        "updated_at": "2024-08-01T10:15:00.000Z"
      }
    }
    ```
*   **404 Not Found (Error)**
    ```json
    {
      "status": "false",
      "message": "Meeting not found or you don't have permission to update it."
    }
    ```

---

## 4. Delete a Meeting

Deletes a meeting.

*   **Endpoint:** `DELETE /:id`
*   **Description:** Permanently deletes a meeting.
*   **Permissions:** Only the user who created the meeting can delete it.

### Responses

*   **200 OK (Success)**
    ```json
    {
      "status": "true",
      "message": "Meeting deleted successfully."
    }
    ```
*   **404 Not Found (Error)**
    ```json
    {
      "status": "false",
      "message": "Meeting not found or you don't have permission to delete it."
    }
    ```

---

## Recurrence & Date Format Rules

The `date` field's format is directly tied to the `recurrence` value. Please adhere to these rules carefully.

| `recurrence`  | `date` Format        | Example       | Description                                    |
| :------------ | :------------------- | :------------ | :--------------------------------------------- |
| `once`        | `YYYY-MM-DD HH:mm`   | `2024-08-25 10:30` | A specific date and time.                  |
| `daily`       | `HH:mm`              | `15:00`       | A specific time every day.                     |
| `weekly`      | `D-HH:mm`            | `1-09:00`     | Day of the week (1=Mon, 7=Sun) and time.       |
| `monthly`     | `DD-HH:mm`           | `15-11:00`    | Day of the month (01-31) and time.             |
| `quarterly`   | `M-DD-HH:mm`         | `2-15-14:00`  | Month within the quarter (1-3) and day/time.   |
| `half-yearly` | `M-DD-HH:mm`         | `4-10-16:00`  | Month within the half-year (1-6) and day/time. |
| `yearly`      | `MM-DD-HH:mm`        | `11-05-18:30` | Month (01-12), day (01-31), and time.          |
