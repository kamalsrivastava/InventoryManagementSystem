def test_create_customer(client):
    resp = client.post(
        "/customers",
        json={"full_name": "Bob", "email": "bob@example.com", "phone": "55555"},
    )
    assert resp.status_code == 201


def test_duplicate_email_rejected(client, customer):
    resp = client.post(
        "/customers",
        json={"full_name": "Other", "email": customer["email"], "phone": "999"},
    )
    assert resp.status_code == 409


def test_invalid_email_rejected(client):
    resp = client.post(
        "/customers",
        json={"full_name": "Bad", "email": "not-an-email", "phone": "999"},
    )
    assert resp.status_code == 422


def test_delete_customer(client, customer):
    assert client.delete(f"/customers/{customer['id']}").status_code == 204
    assert client.get(f"/customers/{customer['id']}").status_code == 404
