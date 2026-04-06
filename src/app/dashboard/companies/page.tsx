import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { AddCompanyForm } from '@/components/dashboard/add-company-form'
import Link from 'next/link'

export default async function CompaniesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: companies } = await supabase
    .from('companies')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes sociétés</h1>
          <p className="text-gray-500 mt-1">Gérez les entreprises dont vous suivez la comptabilité</p>
        </div>
        <AddCompanyForm />
      </div>

      {(companies || []).length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🏢</p>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Aucune société</h2>
          <p className="text-gray-500 mb-6">Ajoutez votre première société pour commencer</p>
          <AddCompanyForm />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(companies || []).map(company => (
            <Link key={company.id} href={`/dashboard/companies/${company.id}`}>
              <Card className="hover:border-blue-200 hover:shadow-md transition-all cursor-pointer h-full">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-700 font-bold text-lg">
                        {company.name[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{company.name}</h3>
                      {company.siret && (
                        <p className="text-xs text-gray-500 mt-0.5">SIRET : {company.siret}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        Depuis le {new Date(company.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <span className="text-gray-300">→</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
