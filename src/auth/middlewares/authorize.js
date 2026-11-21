export function authorize(...perfisPermitidos) {
    return async function (request, reply) {
        // Verifica se o JWT existe e é válido
        try {
            await request.jwtVerify()
        } catch (error) {
            return reply.code(401).send({
                message: 'Token ausente, inválido ou expirado!'
            })
        }

        // Recupera os perfis presentes no JWT
        const roles = request.user.roles || []

        // Verifica se o usuário possui um perfil autorizado
        const autorizado = perfisPermitidos.some(
            perfil => roles.includes(perfil)
        )

        if (!autorizado) {
            return reply.code(403).send({
                message: 'Acesso negado! Perfil não autorizado.'
            })
        }
    }
}