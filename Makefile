NAME		=	ft_transcendence

VOLUME_PATH	=
COMPOSE 	=	docker compose -f ./src/Docker-compose.yml
PRODUCTION 	=	docker compose -f ./src/Docker-compose-prod.yml

API			=	api
CLIENT		=	client
POSTGRES	=	postgres

# Recipe
################################
start: get_ip _start

prod: get_ip _prod

stop: _stop

build: _build

clean: stop _clean

fclean: clean
	$(COMPOSE) down --volumes
	$(PRODUCTION) down --volumes
	rm -rf ./src/api/avatar

restart: _restart clean build start

show:
	$(COMPOSE) ps

log: _log

create_dir:
	mkdir -p $(VOLUME_PATH)/postgres

list: help
help: _help

update-npm:
	@cd ./src/client && npm update
	@cd ./src/api && npm update

get_ip:
	@./src/script/get_ip.sh

.PHONY: start stop build clean fclean restart show log create_dir list help get_ip prod

# ===============================================

# turn them into do-nothing targets
$(eval client:;@:)
$(eval api:;@:)
$(eval db:;@:)

BUILD	=	$(COMPOSE) build --no-cache --parallel
.PHONY: _build
_build:
ifeq (client, $(filter client,$(MAKECMDGOALS)))
	@echo 'building client'
	$(BUILD) $(CLIENT)
else ifeq (api, $(filter api,$(MAKECMDGOALS)))
	@echo 'building api'
	$(BUILD) $(API)
else ifeq (db, $(filter db,$(MAKECMDGOALS)))
	@echo 'building postgres'
	$(BUILD) $(POSTGRES)
else
	@echo 'building all'
	$(BUILD)
endif

.PHONY: _prod
_prod:
	@echo 'starting all in production mode'
	@src/script/start_prod.sh
	$(PRODUCTION) up -d

START	=	$(COMPOSE) up -d
.PHONY: _start
_start:
ifeq (client, $(filter client,$(MAKECMDGOALS)))
	@echo 'starting client'
	$(START) $(CLIENT)
else ifeq (api, $(filter api, $(MAKECMDGOALS)))
	@echo 'starting api'
	$(START) $(API)
else ifeq (db, $(filter db, $(MAKECMDGOALS)))
	@echo 'starting postgres'
	$(START) $(POSTGRES)
else
	@echo 'starting all'
	$(START)
endif

STOP	=	$(COMPOSE) stop
.PHONY: _stop
_stop:
ifeq (client, $(filter client, $(MAKECMDGOALS)))
	@echo 'stop client'
	$(STOP) $(CLIENT)
else ifeq (api, $(filter api, $(MAKECMDGOALS)))
	@echo 'stop api'
	$(STOP) $(API)
else ifeq (db, $(filter db, $(MAKECMDGOALS)))
	@echo 'stop postgres'
	$(STOP) $(POSTGRES)
else
	@echo 'stop all'
	$(STOP)

endif

CLEAN	=	docker rmi -f
.PHONY: _clean
_clean:
ifeq (client, $(filter client,$(MAKECMDGOALS)))
	@echo 'removing client image'
	$(CLEAN) $(NAME)-$(CLIENT)
else ifeq (api, $(filter api,$(MAKECMDGOALS)))
	@echo 'removing api image'
	$(CLEAN) $(NAME)-$(API)
else ifeq (db, $(filter db,$(MAKECMDGOALS)))
	@echo 'removing postgres image'
	$(CLEAN) $(POSTGRES)
else
	@echo 'removing all images'
	$(CLEAN) $(NAME)-$(CLIENT) $(NAME)-$(API)
endif

.PHONY: _restart
_restart:
ifeq (client, $(filter client,$(MAKECMDGOALS)))
	@echo 'Restarting client'
else ifeq (api, $(filter api,$(MAKECMDGOALS)))
	@echo 'Restarting api'
else ifeq (db, $(filter db,$(MAKECMDGOALS)))
	@echo 'Restarting postgres'
else
	@echo 'Restarting all'
endif

.PHONY: _log
LOG	=	docker logs -f
_log:
ifeq (client, $(filter client,$(MAKECMDGOALS)))
	@echo 'Logging client'
	$(LOG) $(NAME)-$(CLIENT)
else ifeq (api, $(filter api,$(MAKECMDGOALS)))
	@echo 'Logging api'
	$(LOG) $(NAME)-$(API)
else ifeq (db, $(filter db,$(MAKECMDGOALS)))
	@echo 'Logging postgres'
	$(LOG) $(NAME)-$(POSTGRES)
endif

.PHONY: _help
_help:
	@echo "======================================================"
	@echo "\t\t\tMAKE HELP"
	@echo "======================================================"
	@echo ""
	@echo "Command: start stop build clean fclean restart show log"
	@echo ""


# ==============================================================================
#	Extra
# ==============================================================================
_GREY	= \033[30m
_RED	= \033[31m
_ORANGE	= \033[38;5;209m
_GREEN	= \033[32m
_YELLOW	= \033[33m
_BLUE	= \033[34m
_PURPLE	= \033[35m
_CYAN	= \033[36m
_WHITE	= \033[37m
_END	= \033[0m