
import authController from './authController.js'
import { authorize } from './middlewares/authorize.js'

export default async function authRoutes(app) {
    app.post('/login', {
        schema: {
            tags: ['Autenticação'],
            summary: 'Autentica um usuário por e-mail e senha',
            body: {
                type: 'object',
                required: ['email', 'senha'],
                additionalProperties: false,
                properties: {
                    email: {
                        type: 'string',
                        format: 'email'
                    },
                    senha: {
                        type: 'string',
                        minLength: 1
                    }
                }
            }
        }
    }, authController.login.bind(authController))

    app.get('/admin/teste', {
        preHandler: authorize('ADMIN'),
        schema: {
            tags: ['Autenticação'],
            summary: 'Testa o acesso exclusivo de administradores'
        }
    }, async (request, reply) => {
        return reply.send({
            message: 'Acesso administrativo autorizado!',
            usuarioId: request.user.sub,
            roles: request.user.roles
        })
    })
}
