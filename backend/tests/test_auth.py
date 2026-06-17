def test_register_and_login(anon_client):
    r = anon_client.post("/auth/register", json={"email": "a@b.com", "password": "secret123"})
    assert r.status_code == 201
    r = anon_client.post("/auth/login", json={"email": "a@b.com", "password": "secret123"})
    assert r.status_code == 200
    assert "access_token" in r.json()


def test_duplicate_registration_rejected(anon_client):
    anon_client.post("/auth/register", json={"email": "a@b.com", "password": "secret123"})
    r = anon_client.post("/auth/register", json={"email": "a@b.com", "password": "secret123"})
    assert r.status_code == 409


def test_login_wrong_password(anon_client):
    anon_client.post("/auth/register", json={"email": "a@b.com", "password": "secret123"})
    r = anon_client.post("/auth/login", json={"email": "a@b.com", "password": "wrong"})
    assert r.status_code == 401


def test_short_password_rejected(anon_client):
    r = anon_client.post("/auth/register", json={"email": "a@b.com", "password": "123"})
    assert r.status_code == 422


def test_reads_are_public(anon_client):
    # GET endpoints require no auth.
    assert anon_client.get("/products").status_code == 200
    assert anon_client.get("/customers").status_code == 200
    assert anon_client.get("/orders").status_code == 200
    assert anon_client.get("/dashboard/summary").status_code == 200


def test_writes_require_auth(anon_client):
    # No token -> 403 (missing credentials) on every mutating endpoint.
    assert anon_client.post(
        "/products", json={"name": "X", "sku": "X-1", "price": 1, "quantity": 1}
    ).status_code in (401, 403)
    assert anon_client.delete("/products/1").status_code in (401, 403)
    assert anon_client.post(
        "/customers", json={"full_name": "X", "email": "x@y.com", "phone": "123"}
    ).status_code in (401, 403)


def test_invalid_token_rejected(anon_client):
    anon_client.headers.update({"Authorization": "Bearer not-a-real-token"})
    r = anon_client.post(
        "/products", json={"name": "X", "sku": "X-1", "price": 1, "quantity": 1}
    )
    assert r.status_code == 401


def test_authenticated_write_succeeds(client):
    # `client` carries a valid token.
    r = client.post(
        "/products", json={"name": "Keyboard", "sku": "KB-9", "price": 49, "quantity": 10}
    )
    assert r.status_code == 201
