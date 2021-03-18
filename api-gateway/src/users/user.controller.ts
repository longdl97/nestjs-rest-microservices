import { PinoLogger } from 'nestjs-pino'
import { ClientGrpc, Client } from '@nestjs/microservices'
import { Controller, Get, Post, Delete, Query, Body, Param, Inject, OnModuleInit, NotFoundException, Header } from '@nestjs/common'
import { isEmpty } from 'lodash'

import { QueryUtils } from '../utils/query.utils'
import { Count } from '../commons/interfaces/commons.interface'
import { RequestQuery, QueryResponse } from '../commons/interfaces/request-response.interface'

import { CommentsService, Comment, CommentsQueryResult } from '../comments/comments.interface'
import { OrganizationsService, Organization, OrganizationsQueryResult } from '../organizations/organizations.interface'
import { UsersService, UsersQueryResult } from './users.interface'

import { CommentDto } from '../comments/comment.dto'

import { CommentsServiceClientOptions } from '../comments/comments-svc.options'
import { OrganizationsServiceClientOptions } from '../organizations/organization-svc.options'
import { UsersServiceClientOptions } from './users-svc.options'

@Controller('users')
export class UsersController implements OnModuleInit {
  constructor(@Inject('QueryUtils') private readonly queryUtils: QueryUtils, private readonly logger: PinoLogger) {
    logger.setContext(UsersController.name)
  }

  @Client(CommentsServiceClientOptions)
  private readonly commentsServiceClient: ClientGrpc

  @Client(OrganizationsServiceClientOptions)
  private readonly organizationsServiceClient: ClientGrpc

  @Client(UsersServiceClientOptions)
  private readonly usersServiceClient: ClientGrpc

  private commentsService: CommentsService

  private organizationsService: OrganizationsService

  private usersService: UsersService

  onModuleInit() {
    this.commentsService = this.commentsServiceClient.getService<CommentsService>('CommentsService')
    this.organizationsService = this.organizationsServiceClient.getService<OrganizationsService>('OrganizationsService')
    this.usersService = this.usersServiceClient.getService<UsersService>('UsersService')
  }

  @Get()
  @Header('Content-Type', 'application/json')
  async findUsers(@Query() query: RequestQuery): Promise<QueryResponse> {
    this.logger.info('UsersController#findUser.call', query)

    const args = {
      ...(await this.queryUtils.getQueryParams(query))
    }

    const { count } = await this.usersService
      .count({
        where: !isEmpty(query.q) ? JSON.stringify('') : undefined
      })
      .toPromise()

    const data: UsersQueryResult = await this.usersService
      .findAll({
        attributes: args.attributes,
        where: !isEmpty(query.q) ? JSON.stringify('') : undefined,
        order: JSON.stringify(args.order),
        offset: args.offset,
        limit: args.limit
      })
      .toPromise()

    const result: QueryResponse = {
      totalRecords: count,
      totalPages: Math.ceil(count / args.limit),
      page: args.page,
      limit: args.limit,
      ...data
    }

    this.logger.info('UsersController#findUser.result', result)

    return result
  }
}
