import { BadRequestException, Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  Crud,
  CrudAuth,
  CrudController,
  CrudRequest,
  Override,
  ParsedBody,
  ParsedRequest,
} from '@nestjsx/crud';
import { UserEntity } from '../user/entity/user.entity';
import { UserOwnManagementService } from './user-own-management.service';
import { Roles } from '../common/decorator/roles.decorator';
import { AppRoles } from '../common/enum/roles.enum';

/**
 * This route is for non admin user only
 */
@Controller({
  path: 'user-own-management',
  version: '1',
})
@Crud({
  model: {
    type: UserEntity,
  },
  query: {
    join: {
      profile: {
        eager: false,
      },
    },
    exclude: ['password'],
  },
  routes: {
    /**
     * Disable CRUD features for general users
     */
    exclude: [
      'deleteOneBase',
      'replaceOneBase',
      'createManyBase',
      'createOneBase',
      'getManyBase',
    ],
  },
})
@CrudAuth({
  property: 'user',
  filter: (user: UserEntity) => ({
    id: user.id,
  }),
})
@ApiTags('User Own Management')
@Roles(AppRoles.DEFAULT)
@ApiBearerAuth()
export class UserOwnManagementController implements CrudController<UserEntity> {
  constructor(public service: UserOwnManagementService) {}

  get base(): CrudController<UserEntity> {
    return this;
  }

  /**
   * In case user update username which may be duplicated with other username
   * Throw bad request exception
   * @param req
   * @param dto
   */
  @Override('updateOneBase')
  async updateUser(
    @ParsedRequest() req: CrudRequest,
    @ParsedBody() dto: UserEntity,
  ) {
    try {
      await this.base.updateOneBase(req, dto);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
