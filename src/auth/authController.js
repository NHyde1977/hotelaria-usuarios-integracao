
import usuarioRepository from '../usuarios/repositories/usuarioRepository.js'
import { verifyPassword } from '../usuarios/utils/password.js'

class AuthController {
    async login(request, reply) {
        const { email, senha } = request.body

        // Localiza o usuário pelo e-mail
        const usuario = await usuarioRepository.findByEmail(email)

        if (!usuario) {
            return reply.code(401).send({
                message: 'E-mail ou senha inválidos!'
            })
        }

        // Recupera o hash armazenado no banco
        const senhaHash = await usuarioRepository.findSenhaHashById(usuario.id)

        // Verifica a senha informada
        const senhaValida = senhaHash
            ? await verifyPassword(senha, senhaHash)
            : false

        if (!senhaValida) {
            return reply.code(401).send({
                message: 'E-mail ou senha inválidos!'
            })
        }

        // Impede login de usuários inativos ou bloqueados
        if (usuario.status !== 'ATIVO') {
            return reply.code(403).send({
                message: 'Usuário inativo ou bloqueado!'
            })
        }

        const roles = await usuarioRepository.findRolesByUsuarioId(usuario.id)

const token = await reply.jwtSign(
    {
        sub: usuario.id,
        email: usuario.email,
        roles
    },
    { expiresIn: '1h' }
)

        return reply.send({
            token,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                status: usuario.status,
        roles
            }
        })
    }
}

export default new AuthController()
