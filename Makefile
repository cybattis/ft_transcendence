VOLUME_PATH	=	./src/.volumes
COMPOSE 	=	docker compose -f ./src/Docker-compose.yml

# Recipe
################################
start:
	$(COMPOSE) up -d

stop:
	$(COMPOSE) down

build:
	$(COMPOSE) build --no-cache

clean:
	$(COMPOSE) down --volumes
	rm -rf $(VOLUME_PATH)

restart: stop clean build start

show:
	$(COMPOSE) ps

# ===============================================

create_dir:
	mkdir -p $(VOLUME_PATH)/postgres
	mkdir -p $(VOLUME_PATH)/pgadmin

.PHONY: start stop show build clean restart reset create_dir