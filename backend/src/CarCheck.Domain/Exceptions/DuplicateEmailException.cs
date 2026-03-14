namespace CarCheck.Domain.Exceptions;

public class DuplicateEmailException : Exception
{
    public DuplicateEmailException() : base("E-postadressen är redan registrerad.") { }
}
